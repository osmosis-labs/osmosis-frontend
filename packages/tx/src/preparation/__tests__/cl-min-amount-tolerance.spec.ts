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
  it("binds base to min0 and quote to min1 in base units, with tokensProvided sorted", async () => {
    jest
      .mocked(makeCreatePositionMsg)
      .mockResolvedValue(
        {} as Awaited<ReturnType<typeof makeCreatePositionMsg>>
      );
    // base (uosmo) sorts after quote (factory/...), and decimals differ
    await prepareCreateConcentratedLiquidityInitialFullRangePositionMsg(
      { address: "osmo1test" } as unknown as TransactionPreparationContext,
      "1",
      "",
      {
        token: { coinMinimalDenom: "uosmo", coinDecimals: 6 },
        amount: "100",
      } as never,
      {
        token: { coinMinimalDenom: "factory/osmo1x/allUSDC", coinDecimals: 18 },
        amount: "2",
      } as never
    );
    expect(makeCreatePositionMsg).toHaveBeenCalledWith(
      expect.objectContaining({
        tokensProvided: [
          { denom: "factory/osmo1x/allUSDC", amount: "2000000000000000000" },
          { denom: "uosmo", amount: "100000000" },
        ],
        tokenMinAmount0: "95000000",
        tokenMinAmount1: "1900000000000000000",
      })
    );
  });
});
