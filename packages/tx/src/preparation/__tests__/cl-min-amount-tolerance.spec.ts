import { makeCreatePositionMsg } from "../../message-composers";
import {
  applyClMinAmountTolerance,
  prepareCreateConcentratedLiquidityInitialFullRangePositionMsg,
} from "../osmosis";
import type { TransactionPreparationContext } from "../types";

jest.mock("../../message-composers", () => ({
  ...jest.requireActual("../../message-composers"),
  makeCreatePositionMsg: jest.fn(),
}));

describe("applyClMinAmountTolerance", () => {
  it("floors the minimum at the tolerance below the entered amount", () => {
    expect(applyClMinAmountTolerance("1000000", "5")).toBe("950000");
    expect(applyClMinAmountTolerance("999", "5")).toBe("949");
    expect(applyClMinAmountTolerance("0", "5")).toBe("0");
  });

  it("defaults to the shared tolerance, not a wider hidden one", () => {
    expect(applyClMinAmountTolerance("1000000")).toBe("950000");
  });
});

describe("initial full-range position minimums", () => {
  it("uses base-unit amounts in the same denom order as tokensProvided", async () => {
    jest
      .mocked(makeCreatePositionMsg)
      .mockResolvedValue(
        {} as Awaited<ReturnType<typeof makeCreatePositionMsg>>
      );
    // base sorts after quote, and decimals differ
    await prepareCreateConcentratedLiquidityInitialFullRangePositionMsg(
      { address: "osmo1test" } as unknown as TransactionPreparationContext,
      "1",
      "",
      {
        token: { coinMinimalDenom: "uusdc", coinDecimals: 6 },
        amount: "100",
      } as never,
      {
        token: { coinMinimalDenom: "aaa", coinDecimals: 18 },
        amount: "2",
      } as never
    );
    expect(makeCreatePositionMsg).toHaveBeenCalledWith(
      expect.objectContaining({
        tokensProvided: [
          { denom: "aaa", amount: "2000000000000000000" },
          { denom: "uusdc", amount: "100000000" },
        ],
        tokenMinAmount0: "1900000000000000000",
        tokenMinAmount1: "95000000",
      })
    );
  });
});
