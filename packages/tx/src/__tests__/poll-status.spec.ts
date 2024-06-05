import { queryRPCStatus, QueryStatusResponse } from "@osmosis-labs/server";

import { PollingStatusSubscription, StatusHandler } from "../index";

jest.useFakeTimers();

/** Stuff that's not used but in the status response type. */
const baseMockStatusResult: QueryStatusResponse["result"] = {
  validator_info: {
    address: "mock_address",
    pub_key: {
      type: "mock_type",
      value: "mock_value",
    },
    voting_power: "mock_voting_power",
  },
  node_info: {
    protocol_version: {
      p2p: "mock_p2p",
      block: "mock_block",
      app: "mock_app",
    },
    id: "mock_id",
    listen_addr: "mock_listen_addr",
    network: "mock_network",
    version: "mock_version",
    channels: "mock_channels",
    moniker: "mock_moniker",
    other: {
      tx_index: "on" as const,
      rpc_address: "mock_rpc_address",
    },
  },
  sync_info: {
    // overwrite these, but is otherwise a reasonable time range
    latest_block_hash: "mock_latest_block_hash",
    latest_app_hash: "mock_latest_app_hash",
    earliest_block_hash: "mock_earliest_block_hash",
    earliest_app_hash: "mock_earliest_app_hash",
    latest_block_height: "100",
    earliest_block_height: "90",
    latest_block_time: new Date(Date.now() - 10000).toISOString(),
    earliest_block_time: new Date(Date.now() - 20000).toISOString(),
    catching_up: false,
  },
};

jest.mock("@osmosis-labs/server", () => ({
  queryRPCStatus: jest.fn().mockResolvedValue({
    jsonrpc: "2.0",
    id: 1,
    result: {
      validator_info: {
        address: "mock_address",
        pub_key: {
          type: "mock_type",
          value: "mock_value",
        },
        voting_power: "mock_voting_power",
      },
      node_info: {
        protocol_version: {
          p2p: "mock_p2p",
          block: "mock_block",
          app: "mock_app",
        },
        id: "mock_id",
        listen_addr: "mock_listen_addr",
        network: "mock_network",
        version: "mock_version",
        channels: "mock_channels",
        moniker: "mock_moniker",
        other: {
          tx_index: "on" as const,
          rpc_address: "mock_rpc_address",
        },
      },
      sync_info: {
        // reasonable time range
        latest_block_hash: "mock_latest_block_hash",
        latest_app_hash: "mock_latest_app_hash",
        earliest_block_hash: "mock_earliest_block_hash",
        earliest_app_hash: "mock_earliest_app_hash",
        latest_block_height: "100",
        earliest_block_height: "90",
        latest_block_time: new Date(Date.now() - 10000).toISOString(),
        earliest_block_time: new Date(Date.now() - 20000).toISOString(),
        catching_up: false,
      },
    },
  }),
  DEFAULT_LRU_OPTIONS: { max: 10 },
}));

describe("PollingStatusSubscription", () => {
  const mockRPC = "http://mock-rpc-url";
  const defaultBlockTimeMs = 7500;
  let subscription: PollingStatusSubscription;

  beforeEach(() => {
    subscription = new PollingStatusSubscription(mockRPC, defaultBlockTimeMs);
    jest.clearAllMocks();
  });

  it("should initialize with zero subscriptions", () => {
    expect(subscription.subscriptionCount).toBe(0);
  });

  it("should handle errors in startSubscription gracefully", async () => {
    const handler: StatusHandler = jest.fn();
    (queryRPCStatus as jest.Mock).mockRejectedValue(new Error("Network error"));

    // starts loop
    subscription.subscribe(handler);

    // end loop and flush event loop
    jest.runAllTimers();

    expect(handler).not.toHaveBeenCalled();
  });

  it("should increase subscription count when a handler is subscribed", () => {
    const handler: StatusHandler = jest.fn();
    subscription.subscribe(handler);

    expect(subscription.subscriptionCount).toBe(1);

    // end loop and flush event loop
    jest.runAllTimers();
  });

  it("should decrease subscription count when a handler is unsubscribed", () => {
    const handler: StatusHandler = jest.fn();
    const unsubscribe = subscription.subscribe(handler);
    unsubscribe();

    jest.runAllTimers();

    expect(subscription.subscriptionCount).toBe(0);
  });

  it("should call handlers with status and block time", async () => {
    const mockStatus: QueryStatusResponse = {
      jsonrpc: "2.0",
      id: 1,
      result: {
        ...baseMockStatusResult,
        sync_info: {
          ...baseMockStatusResult.sync_info,
          catching_up: false,
          latest_block_height: "100",
          earliest_block_height: "90",
          latest_block_time: new Date().toISOString(),
          earliest_block_time: new Date(Date.now() - 10000).toISOString(),
        },
      },
    };

    (queryRPCStatus as jest.Mock).mockResolvedValue(mockStatus);

    const handler: StatusHandler = jest.fn();
    subscription.subscribe(handler);

    // Run all timers to ensure the subscription logic completes
    jest.runAllTimers();

    // Ensure all promises are resolved by pushing to the event queue
    await Promise.resolve();

    expect(handler).toHaveBeenCalledWith(mockStatus, expect.any(Number));
  });

  describe("calcAverageBlockTimeMs", () => {
    class TestPollingStatusSubscription extends PollingStatusSubscription {
      public test(status: QueryStatusResponse): number {
        return this.calcAverageBlockTimeMs(status);
      }
    }

    let avgBlockTimeSub: TestPollingStatusSubscription;

    beforeEach(() => {
      avgBlockTimeSub = new TestPollingStatusSubscription(
        mockRPC,
        defaultBlockTimeMs
      );
    });

    it("should return default block time if catching up", () => {
      const mockStatus: QueryStatusResponse = {
        jsonrpc: "2.0",
        id: 1,
        result: {
          ...baseMockStatusResult,
          sync_info: {
            ...baseMockStatusResult.sync_info,
            catching_up: true,
          },
        },
      };

      const blockTime = avgBlockTimeSub.test(mockStatus);
      expect(blockTime).toBe(defaultBlockTimeMs);
    });

    it("should return default block time if block height is NaN", () => {
      const mockStatus: QueryStatusResponse = {
        jsonrpc: "2.0",
        id: 1,
        result: {
          ...baseMockStatusResult,
          sync_info: {
            ...baseMockStatusResult.sync_info,
            catching_up: false,
            latest_block_height: "NaN",
            earliest_block_height: "NaN",
            latest_block_time: new Date().toISOString(),
            earliest_block_time: new Date().toISOString(),
          },
        },
      };

      const blockTime = avgBlockTimeSub.test(mockStatus);
      expect(blockTime).toBe(defaultBlockTimeMs);
    });

    it("should calculate a reasonable avg default block time", () => {
      const mockStatus: QueryStatusResponse = {
        jsonrpc: "2.0",
        id: 1,
        result: {
          ...baseMockStatusResult,
          sync_info: {
            ...baseMockStatusResult.sync_info,
            catching_up: false,
            latest_block_height: "100",
            earliest_block_height: "90",
            latest_block_time: new Date(Date.now() - 10000).toISOString(),
            earliest_block_time: new Date(Date.now() - 20000).toISOString(),
          },
        },
      };

      const blockTime = avgBlockTimeSub.test(mockStatus);
      const expectedBlockTime =
        (new Date(mockStatus.result.sync_info.latest_block_time).getTime() -
          new Date(mockStatus.result.sync_info.earliest_block_time).getTime()) /
        (parseInt(mockStatus.result.sync_info.latest_block_height) -
          parseInt(mockStatus.result.sync_info.earliest_block_height));
      expect(blockTime).toBe(Math.ceil(expectedBlockTime));
    });

    it("should return default block time if block time is unreasonable", () => {
      const mockStatus: QueryStatusResponse = {
        jsonrpc: "2.0",
        id: 1,
        result: {
          ...baseMockStatusResult,
          sync_info: {
            ...baseMockStatusResult.sync_info,
            catching_up: false,
            latest_block_height: "100",
            earliest_block_height: "90",
            latest_block_time: new Date().toISOString(),
            earliest_block_time: new Date(Date.now() - 1000000).toISOString(),
          },
        },
      };

      const blockTime = avgBlockTimeSub.test(mockStatus);
      expect(blockTime).toBe(defaultBlockTimeMs);
    });

    it("should return default block time if latest block height is less or equal to than earliest block height", () => {
      const mockStatus: QueryStatusResponse = {
        jsonrpc: "2.0",
        id: 1,
        result: {
          ...baseMockStatusResult,
          sync_info: {
            ...baseMockStatusResult.sync_info,
            catching_up: false,
            latest_block_height: "80",
            earliest_block_height: "90",
            latest_block_time: new Date().toISOString(),
            earliest_block_time: new Date(Date.now() - 1000000).toISOString(),
          },
        },
      };

      const blockTime = avgBlockTimeSub.test(mockStatus);
      expect(blockTime).toBe(defaultBlockTimeMs);
    });

    it("should return default block time if an invalid block time value is returned", () => {
      const mockStatus: QueryStatusResponse = {
        jsonrpc: "2.0",
        id: 1,
        result: {
          ...baseMockStatusResult,
          sync_info: {
            ...baseMockStatusResult.sync_info,
            catching_up: false,
            latest_block_height: "80",
            earliest_block_height: "90",
            latest_block_time: "invalid",
            earliest_block_time: new Date(Date.now() - 1000000).toISOString(),
          },
        },
      };

      const blockTime = avgBlockTimeSub.test(mockStatus);
      expect(blockTime).toBe(defaultBlockTimeMs);
    });
  });
});
