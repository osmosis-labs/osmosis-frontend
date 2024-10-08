// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockChains } from "../../__tests__/mock-chains";
import { server } from "../../__tests__/msw";
import { BridgeEnvironment, TransferStatusReceiver } from "../../interface";
import { SkipApiClient } from "../client";
import {
  SkipStatusProvider,
  SkipTransferStatusProvider,
} from "../transfer-status";

jest.mock("@osmosis-labs/utils", () => ({
  ...jest.requireActual("@osmosis-labs/utils"),
  poll: jest.fn(({ fn, validate }) => {
    const pollFn = async () => {
      const result = await fn();
      if (validate(result)) {
        return result;
      }
    };
    return pollFn();
  }),
}));

const SkipStatusProvider: SkipStatusProvider = {
  transactionStatus: ({ chainID, txHash, env }) => {
    const client = new SkipApiClient(env);
    return client.transactionStatus({ chainID, txHash });
  },
  trackTransaction: () => Promise.resolve(),
};

// silence console errors
jest.spyOn(console, "error").mockImplementation(() => {});

describe("SkipTransferStatusProvider", () => {
  let provider: SkipTransferStatusProvider;
  const mockReceiver: TransferStatusReceiver = {
    receiveNewTxStatus: jest.fn(),
  };

  beforeEach(() => {
    provider = new SkipTransferStatusProvider(
      "mainnet" as BridgeEnvironment,
      MockChains,
      SkipStatusProvider
    );
    provider.statusReceiverDelegate = mockReceiver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct URLs", () => {
    expect(provider.axelarScanBaseUrl).toBe("https://axelarscan.io");
  });

  it("should handle successful transfer status", async () => {
    server.use(
      rest.get("https://api.skip.money/v2/tx/status", (_req, res, ctx) => {
        return res(ctx.json({ state: "STATE_COMPLETED_SUCCESS" }));
      })
    );

    const params = JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 });

    await provider.trackTxStatus(params);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `Skip${params}`,
      "success",
      undefined
    );
  });

  it("should handle failed transfer status", async () => {
    server.use(
      rest.get("https://api.skip.money/v2/tx/status", (_req, res, ctx) => {
        return res(ctx.json({ state: "STATE_COMPLETED_ERROR" }));
      })
    );

    const params = JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 });

    await provider.trackTxStatus(params);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `Skip${params}`,
      "failed",
      undefined
    );
  });

  it("should handle undefined transfer status", async () => {
    server.use(
      rest.get("https://api.skip.money/v2/tx/status", (_req, res, ctx) => {
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
      JSON.stringify({
        sendTxHash: "testTxHash",
        fromChainId: 2,
        toChainId: "osmosis-1",
      })
    );
    expect(url).toBe("https://axelarscan.io/gmp/testTxHash");
  });

  it("should generate correct explorer URL for testnet", () => {
    const testnetProvider = new SkipTransferStatusProvider(
      "testnet" as BridgeEnvironment,
      MockChains,
      SkipStatusProvider
    );
    const url = testnetProvider.makeExplorerUrl(
      JSON.stringify({
        sendTxHash: "testTxHash",
        fromChainId: 2,
        toChainId: "osmosis-1",
      })
    );
    expect(url).toBe("https://testnet.axelarscan.io/gmp/testTxHash");
  });

  it("should generate correct explorer URL for a cosmos chain", () => {
    const cosmosProvider = new SkipTransferStatusProvider(
      "mainnet" as BridgeEnvironment,
      MockChains,
      SkipStatusProvider
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
