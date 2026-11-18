import { BigDec, priceToTick } from "@osmosis-labs/math";
import type { Currency } from "@osmosis-labs/types";
import { Dec, Int } from "@osmosis-labs/unit";

import { makeCreatePositionMsg } from "../../message-composers";
import { prepareCreateConcentratedLiquidityPositionMsg } from "../osmosis";
import type { TransactionPreparationContext } from "../types";

jest.mock("../../message-composers", () => ({
  ...jest.requireActual("../../message-composers"),
  makeCreatePositionMsg: jest.fn(),
}));

describe("prepareCreateConcentratedLiquidityPositionMsg", () => {
  it("treats a position as in range with negative ticks (numeric, not string, comparison)", async () => {
    // price 0.25 gives a negative current tick (about -7.5M). As strings,
    // "-7500000" < "-8000000", so a string comparison would read the position
    // as out of range even though the current tick is numerically inside it.
    const currentTick = priceToTick(new Dec("0.25"));
    const lowerTick = new Int(-8000000);
    const upperTick = new Int(1000);
    expect(currentTick.gte(lowerTick) && currentTick.lt(upperTick)).toBe(true);
    expect(currentTick.toString() >= lowerTick.toString()).toBe(false);

    await prepareCreateConcentratedLiquidityPositionMsg(
      { address: "osmo1test" } as unknown as TransactionPreparationContext,
      "1",
      {
        tickSpacing: 100,
        currentSqrtPrice: new BigDec("0.5"),
      } as Parameters<typeof prepareCreateConcentratedLiquidityPositionMsg>[2],
      lowerTick,
      upperTick,
      undefined,
      {
        currency: { coinMinimalDenom: "uosmo", coinDecimals: 6 },
        amount: "20",
      } as unknown as { currency: Currency; amount: string },
      {
        currency: { coinMinimalDenom: "uusdc", coinDecimals: 6 },
        amount: "10",
      } as unknown as { currency: Currency; amount: string }
    );

    expect(makeCreatePositionMsg).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenMinAmount0: "19000000",
        tokenMinAmount1: "9500000",
      })
    );
  });
});
