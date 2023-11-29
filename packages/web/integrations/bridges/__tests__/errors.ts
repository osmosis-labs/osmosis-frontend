import { BridgeQuoteError, BridgeTransferStatusError } from "../errors";

describe("BridgeQuoteError", () => {
  it("should correctly construct a BridgeQuoteError object", () => {
    const errorData = [
      { errorType: "type1", message: "message1" },
      { errorType: "type2", message: "message2" },
    ];
    const errors = new BridgeQuoteError(errorData);

    expect(errors.name).toBe("BridgeQuoteError");
    expect(errors.errors).toEqual(errorData);
  });

  it("should correctly return the message", () => {
    const errorData = [
      { errorType: "type1", message: "message1" },
      { errorType: "type2", message: "message2" },
    ];
    const errors = new BridgeQuoteError(errorData);

    expect(errors.message).toBe("message1, message2");
  });
});

describe("BridgeTransferStatusError", () => {
  it("should correctly construct a BridgeTransferStatusError object", () => {
    const errorData = [
      { errorType: "type1", message: "message1" },
      { errorType: "type2", message: "message2" },
    ];
    const errors = new BridgeTransferStatusError(errorData);

    expect(errors.name).toBe("BridgeTransferError");
    expect(errors.errors).toEqual(errorData);
  });

  it("should correctly return the message", () => {
    const errorData = [
      { errorType: "type1", message: "message1" },
      { errorType: "type2", message: "message2" },
    ];
    const errors = new BridgeTransferStatusError(errorData);

    expect(errors.message).toBe("message1, message2");
  });
});
