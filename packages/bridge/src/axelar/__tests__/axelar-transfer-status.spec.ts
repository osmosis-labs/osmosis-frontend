// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { server } from "../../__tests__/msw";
import { BridgeEnvironment, TransferStatusReceiver } from "../../interface";
import { TransferStatus } from "../queries";
import { AxelarTransferStatusProvider } from "../transfer-status";

jest.mock("@osmosis-labs/utils", () => ({
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

describe("AxelarTransferStatusProvider", () => {
  let provider: AxelarTransferStatusProvider;
  const mockReceiver: TransferStatusReceiver = {
    receiveNewTxStatus: jest.fn(),
  };

  beforeEach(() => {
    provider = new AxelarTransferStatusProvider("mainnet" as BridgeEnvironment);
    provider.statusReceiverDelegate = mockReceiver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct URLs", () => {
    expect(provider.axelarScanBaseUrl).toBe("https://axelarscan.io");
    expect(provider.axelarApiBaseUrl).toBe("https://api.axelarscan.io");
  });

  it("should generate correct explorer URL", () => {
    const url = provider.makeExplorerUrl("testTxHash");
    expect(url).toBe("https://axelarscan.io/transfer/testTxHash");
  });

  it("should handle successful transfer status", async () => {
    server.use(
      rest.get(
        "https://api.axelarscan.io/cross-chain/transfers-status",
        (_req, res, ctx) => {
          return res(
            ctx.json<TransferStatus>([{ id: "test_id", status: "executed" }])
          );
        }
      )
    );

    await provider.trackTxStatus("testTxHash");

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      "AxelartestTxHash",
      "success",
      undefined
    );
  });

  it("should handle failed transfer status due to insufficient fee", async () => {
    server.use(
      rest.get(
        "https://api.axelarscan.io/cross-chain/transfers-status",
        (_req, res, ctx) => {
          return res(
            ctx.json<TransferStatus>([
              {
                id: "test_id",
                status: "executed",
                send: {
                  amount: 0,
                  created_at: { ms: 0 },
                  fee: 0,
                  id: "",
                  denom: "",
                  recipient_chain: "",
                  sender_chain: "",
                  status: "",
                  type: "",
                  insufficient_fee: true,
                },
              },
            ])
          );
        }
      )
    );

    await provider.trackTxStatus("testTxHash");

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      "AxelartestTxHash",
      "failed",
      "insufficientFee"
    );
  });

  it("should handle failed transfer status due to incomplete stages", async () => {
    server.use(
      rest.get(
        "https://api.axelarscan.io/cross-chain/transfers-status",
        (_req, res, ctx) => {
          return res(
            ctx.json<TransferStatus>([
              {
                id: "test_id",
                status: "executed",
                send: {
                  id: "send_id",
                  type: "send",
                  created_at: { ms: 0 },
                  denom: "denom",
                  amount: 100,
                  fee: 1,
                  sender_chain: "chainA",
                  recipient_chain: "chainB",
                  status: "success",
                },
                link: {
                  id: "link_id",
                  type: "link",
                  txHash: "txHash",
                  denom: "denom",
                  price: 100,
                },
                confirm_deposit: {
                  id: "confirm_deposit_id",
                  type: "confirm_deposit",
                  created_at: { ms: 0 },
                  denom: "denom",
                  amount: "100",
                  status: "failed",
                },
                ibc_send: {
                  id: "ibc_send_id",
                  type: "ibc_send",
                  created_at: { ms: 0 },
                  denom: "denom",
                  amount: 100,
                  sender_address: "sender_address",
                  recipient_address: "recipient_address",
                  status: "success",
                },
              },
            ])
          );
        }
      )
    );

    await provider.trackTxStatus("testTxHash");

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      "AxelartestTxHash",
      "failed",
      undefined
    );
  });

  it("should handle undefined transfer status", async () => {
    server.use(
      rest.get(
        "https://api.axelarscan.io/cross-chain/transfers-status",
        (_req, res, ctx) => {
          return res(ctx.status(404));
        }
      )
    );

    await provider.trackTxStatus("testTxHash");

    expect(mockReceiver.receiveNewTxStatus).not.toHaveBeenCalled();
  });
});
