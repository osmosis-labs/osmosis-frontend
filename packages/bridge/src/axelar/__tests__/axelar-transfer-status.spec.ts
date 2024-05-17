import { BridgeEnvironment, TransferStatusReceiver } from "../../interface";
import { getTransferStatus } from "../queries";
import { AxelarTransferStatusProvider } from "../transfer-status";

jest.mock("../queries", () => ({
  getTransferStatus: jest.fn(),
}));

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
    provider = new AxelarTransferStatusProvider("testnet" as BridgeEnvironment);
    provider.statusReceiverDelegate = mockReceiver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct URLs", () => {
    expect(provider.axelarScanBaseUrl).toBe("https://testnet.axelarscan.io");
    expect(provider.axelarApiBaseUrl).toBe("https://testnet.api.axelarscan.io");
  });

  it("should generate correct explorer URL", () => {
    const url = provider.makeExplorerUrl("testTxHash");
    expect(url).toBe("https://testnet.axelarscan.io/transfer/testTxHash");
  });

  it("should handle successful transfer status", async () => {
    (getTransferStatus as jest.Mock).mockResolvedValue([
      { id: "test_id", status: "executed" },
    ]);

    await provider.trackTxStatus("testTxHash");

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      "axelarProvidertestTxHash",
      { id: "test_id", status: "success" }
    );
  });

  it("should handle failed transfer status due to insufficient fee", async () => {
    (getTransferStatus as jest.Mock).mockResolvedValue([
      { id: "test_id", send: { insufficient_fee: true } },
    ]);

    await provider.trackTxStatus("testTxHash");

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      "axelarProvidertestTxHash",
      { id: "test_id", status: "failed", reason: "insufficientFee" }
    );
  });

  it("should handle failed transfer status due to incomplete stages", async () => {
    (getTransferStatus as jest.Mock).mockResolvedValue([
      {
        id: "test_id",
        send: { status: "success" },
        link: { status: "success" },
        confirm_deposit: { status: "failed" },
        ibc_send: { status: "success" },
      },
    ]);

    await provider.trackTxStatus("testTxHash");

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      "axelarProvidertestTxHash",
      { id: "test_id", status: "failed" }
    );
  });

  it("should handle undefined transfer status", async () => {
    (getTransferStatus as jest.Mock).mockResolvedValue(undefined);

    await provider.trackTxStatus("testTxHash");

    expect(mockReceiver.receiveNewTxStatus).not.toHaveBeenCalled();
  });
});
