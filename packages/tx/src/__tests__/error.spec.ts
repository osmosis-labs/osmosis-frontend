import { isAccountNotFoundError, isInsufficientFeeError } from "../error";

describe("isInsufficientFeeError", () => {
  it("should return true for a valid insufficient fee error message", () => {
    const message =
      "Insufficient balance for transaction fees. Please add funds to continue.";
    expect(isInsufficientFeeError(message)).toBeTruthy();
  });

  it("should return true for the API-generated 'no fee tokens' message (no address)", () => {
    // Surfaced by `selectFeeAmountFromBalances` /
    // `getFallbackFeeAmountFromBalances` and forwarded by the
    // `/api/estimate-gas-fee` endpoint.
    const message =
      "No fee tokens found with sufficient balance on account. Please add funds to continue.";
    expect(isInsufficientFeeError(message)).toBeTruthy();
  });

  it("should return true for the API-generated 'no fee tokens' message (with address)", () => {
    const message =
      "No fee tokens found with sufficient balance on account for address osmo1abcdef. Please add funds to continue.";
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

describe("isAccountNotFoundError", () => {
  it("should return true for a valid account not found error message with address 1", () => {
    const message =
      "account abcdefghijklmnopqrstuvwxyz1234567890abcdef not found";
    expect(isAccountNotFoundError(message)).toBeTruthy();
  });

  it("should return true for a valid account not found error message with address 2", () => {
    const message =
      "account 1234567890abcdefghijklmnopqrstuvwxyz1234567890 not found";
    expect(isAccountNotFoundError(message)).toBeTruthy();
  });

  it("should return true for a valid account not found error message with address 3", () => {
    const message =
      "account zyxwvutsrqponmlkjihgfedcba0987654321zyxwvutsrq not found";
    expect(isAccountNotFoundError(message)).toBeTruthy();
  });

  it("should return false for an invalid account not found error message", () => {
    const message = "Some other error message.";
    expect(isAccountNotFoundError(message)).toBeFalsy();
  });

  it("should return false for an empty message", () => {
    const message = "";
    expect(isAccountNotFoundError(message)).toBeFalsy();
  });
});
