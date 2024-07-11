import { isInsufficientFeeError } from "../error";

describe("isInsufficientFeeError", () => {
  it("should return true for a valid insufficient fee error message", () => {
    const message =
      "Insufficient balance for transaction fees. Please add funds to continue.";
    expect(isInsufficientFeeError(message)).toBeTruthy();
  });

  it("should return false for an invalid insufficient fee error message", () => {
    const message = "Some other error message.";
    expect(isInsufficientFeeError(message)).toBeFalsy();
  });

  it("should return false for an empty message", () => {
    const message = "";
    expect(isInsufficientFeeError(message)).toBeFalsy();
  });
});
