import { queryRPCStatus, queryTx } from "@osmosis-labs/server";
import { TxTracer } from "@osmosis-labs/tx";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { MockChains } from "../../__tests__/mock-chains";
import { TransferStatusReceiver, TxSnapshot } from "../../interface";
import { IbcTransferStatusProvider } from "../transfer-status";

const makeRpcStatusResponse = (
  timeoutHeight: string,
  network = "mock_network"
) => ({
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
      network: network,
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

describe("IbcTransferStatusProvider", () => {
  let provider: IbcTransferStatusProvider;
  let mockReceiver: jest.Mocked<TransferStatusReceiver>;
  let consoleSpy: jest.SpyInstance;

  const createTxSnapshot = (
    overrides: Partial<TxSnapshot> = {}
  ): TxSnapshot => ({
    direction: "deposit",
    createdAtUnix: Date.now(),
    type: "bridge-transfer",
    provider: "IBC",
    fromAddress: "osmo1fromaddress",
    toAddress: "cosmos1toaddress",
    osmoBech32Address: "osmo1osmoaddress",
    fromAsset: {
      denom: "OSMO",
      address: "uosmo",
      amount: "1000",
      decimals: 6,
    },
    toAsset: {
      denom: "ATOM",
      address: "uatom",
      amount: "500",
      decimals: 6,
    },
    status: "pending",
    sendTxHash: "ABC123",
    fromChain: {
      chainId: "osmosis-1",
      prettyName: "Osmosis",
      chainType: "cosmos",
    },
    toChain: {
      chainId: "cosmoshub-4",
      prettyName: "Cosmos Hub",
      chainType: "cosmos",
    },
    estimatedArrivalUnix: Date.now() + 600,
    ...overrides,
  });

  beforeEach(() => {
    mockReceiver = {
      receiveNewTxStatus: jest.fn(),
    };
    provider = new IbcTransferStatusProvider(MockChains, MockAssetLists);
    provider.statusReceiverDelegate = mockReceiver;
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should handle numerical chain IDs - from chain ID", async () => {
    const snapshot: TxSnapshot = createTxSnapshot({
      fromChain: {
        chainId: 1,
        prettyName: "MockChain",
        chainType: "evm",
      },
    });

    await provider.trackTxStatus(snapshot);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected failure when tracing IBC transfer status",
      new Error("Unexpected numerical chain ID for cosmos tx: 1")
    );
    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "connection-error"
    );
  });

  it("should handle numerical chain IDs - to chain ID", async () => {
    const snapshot: TxSnapshot = createTxSnapshot({
      toChain: {
        chainId: 123,
        prettyName: "MockChain",
        chainType: "evm",
      },
    });

    await provider.trackTxStatus(snapshot);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected failure when tracing IBC transfer status",
      new Error("Unexpected numerical chain ID for cosmos tx: 123")
    );
    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "connection-error"
    );
  });

  it("should handle invalid destTimeoutHeight", async () => {
    const snapshot: TxSnapshot = createTxSnapshot({
      sendTxHash: "ABC123",
      toChain: {
        chainId: "cosmoshub-4",
        prettyName: "Cosmos Hub",
        chainType: "cosmos",
      },
    });

    (queryTx as jest.Mock).mockResolvedValue({
      tx_response: {
        code: 0,
        raw_log: "",
        events: [
          {
            type: "send_packet",
            attributes: [
              { key: "packet_src_channel", value: "channel-0" },
              { key: "packet_dst_channel", value: "channel-1" },
              { key: "packet_sequence", value: "1" },
              { key: "packet_timeout_height", value: "123-0" },
            ],
          },
        ],
      },
    });

    await provider.trackTxStatus(snapshot);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected failure when tracing IBC transfer status",
      new Error("Invalid destination timeout height: 123-0")
    );
    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "connection-error"
    );
  });

  it("should handle failed transactions", async () => {
    (queryTx as jest.Mock).mockResolvedValue({
      tx_response: { code: 1 },
    });

    const snapshot: TxSnapshot = createTxSnapshot({
      sendTxHash: "ABC123",
      fromChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
    });

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "failed"
    );
  });

  it("should handle missing events", async () => {
    (queryTx as jest.Mock).mockResolvedValue({
      tx_response: { code: 0, raw_log: "", events: [] },
    });

    const snapshot: TxSnapshot = createTxSnapshot({
      sendTxHash: "ABC123",
      fromChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
    });

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "failed"
    );
  });

  it("should handle successful trace", async () => {
    (queryTx as jest.Mock).mockResolvedValue({
      tx_response: {
        code: 0,
        raw_log: "",
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
      makeRpcStatusResponse("90")
    );

    const snapshot: TxSnapshot = createTxSnapshot({
      sendTxHash: "ABC123",
      fromChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: {
        chainId: "cosmoshub-4",
        prettyName: "Cosmos Hub",
        chainType: "cosmos",
      },
    });

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "success"
    );
  });

  it("should succeed on new chain version", async () => {
    (queryTx as jest.Mock).mockResolvedValue({
      tx_response: {
        code: 0,
        raw_log: "",
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
      makeRpcStatusResponse("90", "osmosis-2")
    );

    const snapshot: TxSnapshot = createTxSnapshot({
      sendTxHash: "ABC123",
      fromChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: {
        chainId: "cosmoshub-4",
        prettyName: "Cosmos Hub",
        chainType: "cosmos",
      },
    });

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "success"
    );
  });

  it("should handle an IBC timeout", async () => {
    (queryTx as jest.Mock).mockResolvedValue({
      tx_response: {
        code: 0,
        raw_log: "",
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
    (queryRPCStatus as jest.Mock).mockResolvedValueOnce(
      makeRpcStatusResponse("110")
    );
    (TxTracer as jest.Mock).mockImplementation(() => ({
      traceTx: jest
        .fn()
        .mockReturnValueOnce(
          new Promise((resolve) => setTimeout(resolve, 1500))
        )
        .mockResolvedValueOnce(undefined),
      close: jest.fn(),
    }));

    const snapshot: TxSnapshot = createTxSnapshot({
      sendTxHash: "ABC123",
      fromChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: {
        chainId: "cosmoshub-4",
        prettyName: "Cosmos Hub",
        chainType: "cosmos",
      },
    });

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "refunded"
    );
    expect(TxTracer).toHaveBeenCalledTimes(2);
  });

  it("should handle unexpected errors", async () => {
    (queryTx as jest.Mock).mockRejectedValue(new Error("Network error"));

    const snapshot: TxSnapshot = createTxSnapshot({
      sendTxHash: "ABC123",
      fromChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
    });

    await provider.trackTxStatus(snapshot);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Unexpected failure when tracing IBC transfer status",
      new Error("Network error")
    );
    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "connection-error"
    );
  });

  it("should generate correct explorer url", () => {
    const snapshot: TxSnapshot = createTxSnapshot({
      sendTxHash: "ABC123",
    });

    const url = provider.makeExplorerUrl(snapshot);

    expect(url).toBe(`https://www.mintscan.io/osmosis/txs/ABC123`);
  });
});
