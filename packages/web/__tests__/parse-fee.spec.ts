import { extractFeeDetailsFromError } from "~/utils/parse-fee";

describe("extractFeeDetailsFromError", () => {
  test.each([
    ["fee of 16.36 USD", { amount: "16.36", currency: "USD" }],
    ["costs $2.5 ETH", { amount: "2.5", currency: "ETH" }],
    ["16.36 USD fee", { amount: "16.36", currency: "USD" }],
    ["$1,234.56 USD fee", { amount: "1234.56", currency: "USD" }],
    ["fee of 1,234 USD", { amount: "1234", currency: "USD" }],
    ["cost $12,345,678.90 EUR", { amount: "12345678.90", currency: "EUR" }],
    ["fee of 16.36 usd", { amount: "16.36", currency: "USD" }],
    [
      "Network reports a fee of 0.000123 BTC.",
      { amount: "0.000123", currency: "BTC" },
    ],
    ["This route costs $10 USDT", { amount: "10", currency: "USDT" }],
  ])("parses valid formats: %s", (msg, expected) => {
    expect(extractFeeDetailsFromError(String(msg))).toEqual(expected);
  });

  test.each([
    ["fee of 1,23.45 USD"], // invalid comma grouping
    ["fee of 1234. USD"], // decimal without trailing digits
    ["fee of 12,,34 USD"], // double comma
    ["fee of 12,34 USD"], // wrong grouping
    ["fee 12."], // missing currency and decimal digits
    ["fee of $ USD"], // missing number
    ["USD 12.34 fee"], // currency before amount not supported pattern
  ])("returns null for invalid formats: %s", (msg) => {
    expect(extractFeeDetailsFromError(String(msg))).toBeNull();
  });
});
