// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockChains } from "../../__tests__/mock-chains";
import { server } from "../../__tests__/msw";
import { BridgeEnvironment, TransferStatusReceiver } from "../../interface";
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

    await provider.trackTxStatus(
      JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 })
    );

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `Squid${JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 })}`,
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

    await provider.trackTxStatus(
      JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 })
    );

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `Squid${JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 })}`,
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

    await provider.trackTxStatus(
      JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 })
    );

    expect(mockReceiver.receiveNewTxStatus).not.toHaveBeenCalled();
  });

  it("should generate correct explorer URL", () => {
    const url = provider.makeExplorerUrl(
      JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1, toChainId: 2 })
    );
    expect(url).toBe("https://axelarscan.io/gmp/testTxHash");
  });

  it("should generate correct explorer URL for testnet", () => {
    const testnetProvider = new SquidTransferStatusProvider(
      "testnet" as BridgeEnvironment,
      MockChains
    );
    const url = testnetProvider.makeExplorerUrl(
      JSON.stringify({
        sendTxHash: "testTxHash",
        fromChainId: 1,
        toChainId: 2,
      })
    );
    expect(url).toBe("https://testnet.axelarscan.io/gmp/testTxHash");
  });

  it("should generate correct explorer URL for a cosmos chain", () => {
    const cosmosProvider = new SquidTransferStatusProvider(
      "mainnet" as BridgeEnvironment,
      MockChains
    );
    const url = cosmosProvider.makeExplorerUrl(
      JSON.stringify({
        sendTxHash: "cosmosTxHash",
        fromChainId: "cosmoshub-4",
        toChainId: "osmosis-1",
      })
    );
    expect(url).toBe("https://www.mintscan.io/cosmos/txs/cosmosTxHash");
  });
});
