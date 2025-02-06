// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockChains } from "../../__tests__/mock-chains";
import { server } from "../../__tests__/msw";
import {
  BridgeEnvironment,
  TransferStatusReceiver,
  TxSnapshot,
} from "../../interface";
import { SquidTransferStatusProvider } from "../transfer-status";

jest.mock("@osmosis-labs/utils", () => {
  const originalModule = jest.requireActual("@osmosis-labs/utils");
  return {
    ...originalModule,
    poll: jest.fn(({ fn, validate }) => {
      const pollFn = async () => {
        const result = await fn();
        if (validate(result)) {
          return result;
        }
      };
      return pollFn();
    }),
  };
});

// silence console errors
jest.spyOn(console, "error").mockImplementation(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

describe("SquidTransferStatusProvider", () => {
  let provider: SquidTransferStatusProvider;
  const mockReceiver: TransferStatusReceiver = {
    receiveNewTxStatus: jest.fn(),
  };

  const createTxSnapshot = (
    overrides: Partial<TxSnapshot> = {}
  ): TxSnapshot => ({
    direction: "deposit",
    createdAtUnix: Date.now(),
    type: "bridge-transfer",
    provider: "Squid",
    fromAddress: "0xFromAddress",
    toAddress: "0xToAddress",
    osmoBech32Address: "osmo1address",
    fromAsset: {
      denom: "OSMO",
      address: "uosmo",
      decimals: 6,
      amount: "1000",
    },
    toAsset: {
      denom: "ATOM",
      address: "uatom",
      decimals: 6,
      amount: "1000",
    },
    status: "pending",
    sendTxHash: "testTxHash",
    fromChain: {
      chainId: 1,
      prettyName: "Chain One",
      chainType: "evm",
    },
    toChain: {
      chainId: 2,
      prettyName: "Chain Two",
      chainType: "evm",
    },
    estimatedArrivalUnix: Date.now() + 600,
    ...overrides,
  });

  beforeEach(() => {
    provider = new SquidTransferStatusProvider(
      "mainnet" as BridgeEnvironment,
      MockChains
    );
    provider.statusReceiverDelegate = mockReceiver;
  });

  it("should initialize with correct URLs", () => {
    expect(provider.squidScanBaseUrl).toBe("https://axelarscan.io");
  });

  it("should handle successful transfer status", async () => {
    server.use(
      rest.get("https://api.0xsquid.com/v1/status", (_req, res, ctx) => {
        return res(
          ctx.json({ id: "testTxHash", squidTransactionStatus: "success" })
        );
      })
    );

    const snapshot = createTxSnapshot();

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "success",
      undefined
    );
  });

  it("should handle failed transfer status", async () => {
    server.use(
      rest.get("https://api.0xsquid.com/v1/status", (_req, res, ctx) => {
        return res(
          ctx.json({ id: "testTxHash", squidTransactionStatus: "needs_gas" })
        );
      })
    );

    const snapshot = createTxSnapshot();

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "failed",
      "insufficientFee"
    );
  });

  it("should handle undefined transfer status", async () => {
    server.use(
      rest.get("https://api.0xsquid.com/v1/status", (_req, res, ctx) => {
        return res(ctx.status(404));
      })
    );

    const snapshot = createTxSnapshot();

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).not.toHaveBeenCalled();
  });

  it("should generate correct explorer URL", () => {
    const snapshot = createTxSnapshot({
      sendTxHash: "testTxHash",
      fromChain: { chainId: 1, prettyName: "Chain A", chainType: "evm" },
      toChain: { chainId: 2, prettyName: "Chain B", chainType: "evm" },
    });
    const url = provider.makeExplorerUrl(snapshot);
    expect(url).toBe("https://axelarscan.io/gmp/testTxHash");
  });

  it("should generate correct explorer URL for testnet", () => {
    const testnetProvider = new SquidTransferStatusProvider(
      "testnet" as BridgeEnvironment,
      MockChains
    );
    const snapshot = createTxSnapshot({
      sendTxHash: "testTxHash",
      fromChain: {
        chainId: 1,
        prettyName: "Chain A",
        chainType: "evm",
      },
      toChain: { chainId: 2, prettyName: "Chain B", chainType: "evm" },
    });
    const url = testnetProvider.makeExplorerUrl(snapshot);
    expect(url).toBe("https://testnet.axelarscan.io/gmp/testTxHash");
  });

  it("should generate correct explorer URL for a cosmos chain", () => {
    const cosmosProvider = new SquidTransferStatusProvider(
      "mainnet" as BridgeEnvironment,
      MockChains
    );
    const snapshot = createTxSnapshot({
      sendTxHash: "cosmosTxHash",
      fromChain: {
        chainId: "cosmoshub-4",
        prettyName: "Cosmos Hub",
        chainType: "cosmos",
      },
      toChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
    });
    const url = cosmosProvider.makeExplorerUrl(snapshot);
    expect(url).toBe("https://www.mintscan.io/cosmos/txs/cosmosTxHash");
  });
});
