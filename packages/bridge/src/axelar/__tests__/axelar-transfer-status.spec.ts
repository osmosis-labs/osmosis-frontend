// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { server } from "../../__tests__/msw";
import {
  BridgeEnvironment,
  TransferStatusReceiver,
  TxSnapshot,
} from "../../interface";
import { TransferStatus } from "../queries";
import { AxelarTransferStatusProvider } from "../transfer-status";

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

afterEach(() => {
  jest.clearAllMocks();
});

// silence console errors
jest.spyOn(console, "error").mockImplementation(() => {});

describe("AxelarTransferStatusProvider", () => {
  let provider: AxelarTransferStatusProvider;
  const mockReceiver: TransferStatusReceiver = {
    receiveNewTxStatus: jest.fn(),
  };

  const testSnapshot: TxSnapshot = {
    direction: "deposit",
    createdAtUnix: Date.now(),
    type: "bridge-transfer",
    provider: "Axelar",
    fromAddress: "fromAddress",
    toAddress: "toAddress",
    osmoBech32Address: "osmoAddress",
    fromAsset: {
      amount: "100",
      denom: "denom",
      imageUrl: "imageUrl",
      address: "address",
      decimals: 6,
    },
    toAsset: {
      amount: "100",
      denom: "denom",
      imageUrl: "imageUrl",
      address: "address",
      decimals: 6,
    },
    status: "pending",
    sendTxHash: "testTxHash",
    fromChain: {
      prettyName: "Chain A",
      chainId: 1,
      chainType: "evm",
    },
    toChain: {
      prettyName: "Chain B",
      chainId: 2,
      chainType: "evm",
    },
    estimatedArrivalUnix: Date.now() + 1000,
  };

  beforeEach(() => {
    provider = new AxelarTransferStatusProvider("mainnet" as BridgeEnvironment);
    provider.statusReceiverDelegate = mockReceiver;
  });

  it("should initialize with correct URLs", () => {
    expect(provider.axelarScanBaseUrl).toBe("https://axelarscan.io");
    expect(provider.axelarApiBaseUrl).toBe("https://api.axelarscan.io");
  });

  it("should generate correct explorer URL", () => {
    const url = provider.makeExplorerUrl(testSnapshot);
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

    await provider.trackTxStatus(testSnapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      "testTxHash",
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

    await provider.trackTxStatus(testSnapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      "testTxHash",
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

    await provider.trackTxStatus(testSnapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      "testTxHash",
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

    await provider.trackTxStatus(testSnapshot);

    expect(mockReceiver.receiveNewTxStatus).not.toHaveBeenCalled();
  });
});
