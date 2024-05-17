// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { server } from "../../__tests__/msw";
import { BridgeEnvironment, TransferStatusReceiver } from "../../interface";
import { SkipTransferStatusProvider } from "../transfer-status";

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

describe("SkipTransferStatusProvider", () => {
  let provider: SkipTransferStatusProvider;
  const mockReceiver: TransferStatusReceiver = {
    receiveNewTxStatus: jest.fn(),
  };

  beforeEach(() => {
    provider = new SkipTransferStatusProvider("mainnet" as BridgeEnvironment);
    provider.statusReceiverDelegate = mockReceiver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct URLs", () => {
    expect(provider.axelarScanBaseUrl).toBe("https://axelarscan.io");
  });

  it("should generate correct explorer URL", () => {
    const url = provider.makeExplorerUrl(
      JSON.stringify({ sendTxHash: "testTxHash" })
    );
    expect(url).toBe("https://axelarscan.io/gmp/testTxHash");
  });

  it("should handle successful transfer status", async () => {
    server.use(
      rest.get("https://api.skip.money/v2/tx/status", (_req, res, ctx) => {
        return res(ctx.json({ state: "STATE_COMPLETED_SUCCESS" }));
      })
    );

    await provider.trackTxStatus(
      JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 })
    );

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `Skip${JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 })}`,
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

    await provider.trackTxStatus(
      JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 })
    );

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      `Skip${JSON.stringify({ sendTxHash: "testTxHash", fromChainId: 1 })}`,
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
});
