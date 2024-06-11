import { queryRPCStatus, queryTx } from "@osmosis-labs/server";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { MockChains } from "../../__tests__/mock-chains";
import { TransferStatusReceiver } from "../../interface";
import { IBCTransferStatusProvider } from "../transfer-status";

const makeRpcStatusResponse = (timeoutHeight: string) => ({
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
      latest_block_height: timeoutHeight,
      earliest_block_height: "90",
      latest_block_time: new Date(Date.now() - 10000).toISOString(),
      earliest_block_time: new Date(Date.now() - 20000).toISOString(),
      catching_up: false,
    },
  },
});

jest.mock("@osmosis-labs/server", () => ({
  queryTx: jest.fn(),
  queryRPCStatus: jest.fn(),
  DEFAULT_LRU_OPTIONS: { max: 10 },
}));

jest.mock("@osmosis-labs/tx", () => ({
  ...jest.requireActual("@osmosis-labs/tx"),
  TxTracer: jest.fn().mockImplementation(() => ({
    traceTx: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
  })),
}));

describe("IBCTransferStatusProvider", () => {
  let provider: IBCTransferStatusProvider;
  let mockReceiver: jest.Mocked<TransferStatusReceiver>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReceiver = {
      receiveNewTxStatus: jest.fn(),
    };
    provider = new IBCTransferStatusProvider(MockChains, MockAssetLists);
    provider.statusReceiverDelegate = mockReceiver;
    // silences console errors and serves as a spy to test for calls
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it("should handle numerical chain IDs", async () => {
    const params = JSON.stringify({
      sendTxHash: "ABC123",
      fromChainId: 1,
      toChainId: "osmosis-1",
    });

    provider.trackTxStatus(params);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected failure when tracing IBC transfer status",
      new Error("Unexpected numerical chain ID for cosmos tx: 1")
    );
    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `IBC${params}`,
      "connection-error"
    );
  });

  it("should handle failed transactions", async () => {
    (queryTx as jest.Mock).mockResolvedValue({
      // positive error code = failed tx on chain
      tx_response: { code: 1 },
    });

    const params = JSON.stringify({
      sendTxHash: "ABC123",
      fromChainId: "osmosis-1",
      toChainId: "osmosis-1",
    });

    await provider.trackTxStatus(params);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `IBC${params}`,
      "failed"
    );
  });

  it("should handle missing events", async () => {
    (queryTx as jest.Mock).mockResolvedValue({
      tx_response: { code: 0, events: [] },
    });

    const params = JSON.stringify({
      sendTxHash: "ABC123",
      fromChainId: "osmosis-1",
      toChainId: "osmosis-1",
    });

    await provider.trackTxStatus(params);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `IBC${params}`,
      "failed"
    );
  });

  it("should handle successful trace", async () => {
    (queryTx as jest.Mock).mockResolvedValue({
      tx_response: {
        code: 0,
        events: [
          {
            type: "send_packet",
            attributes: [
              { key: "packet_src_channel", value: "channel-0" },
              { key: "packet_dst_channel", value: "channel-1" },
              { key: "packet_sequence", value: "1" },
              { key: "packet_timeout_height", value: "1-100" },
            ],
          },
        ],
      },
    });
    (queryRPCStatus as jest.Mock).mockResolvedValue(
      // not timed out
      makeRpcStatusResponse("100000")
    );

    const params = JSON.stringify({
      sendTxHash: "ABC123",
      fromChainId: "osmosis-1",
      toChainId: "cosmoshub-4",
    });

    await provider.trackTxStatus(params);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `IBC${params}`,
      "success"
    );
  });

  it("should handle unexpected errors", async () => {
    (queryTx as jest.Mock).mockRejectedValue(new Error("Network error"));

    const params = JSON.stringify({
      sendTxHash: "ABC123",
      fromChainId: "osmosis-1",
      toChainId: "osmosis-1",
    });

    await provider.trackTxStatus(params);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected failure when tracing IBC transfer status",
      new Error("Network error")
    );
    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `IBC${params}`,
      "connection-error"
    );
  });
});
