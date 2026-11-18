import { BigDec, priceToTick } from "@osmosis-labs/math";
import type { Currency } from "@osmosis-labs/types";
import { Dec, Int } from "@osmosis-labs/unit";

import { makeCreatePositionMsg } from "../../message-composers";
import {
  prepareCreateConcentratedLiquidityPositionMsg,
  prepareZapInToConcentratedPositionMsg,
} from "../osmosis";
import type { TransactionPreparationContext } from "../types";

jest.mock("../../message-composers", () => ({
  ...jest.requireActual("../../message-composers"),
  makeCreatePositionMsg: jest.fn(),
  makeSwapExactAmountInMsg: jest.fn(),
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

describe("prepareZapInToConcentratedPositionMsg", () => {
  it("drops a zero-amount provided coin, which the chain rejects", async () => {
    // A range that needs only the other token swaps the whole input, so the
    // provided side's remainder is zero.
    const [, buildMsgs] = await prepareZapInToConcentratedPositionMsg(
      { address: "osmo1test" } as unknown as TransactionPreparationContext,
      "1",
      { tickSpacing: 100 },
      new Int(-8000000),
      new Int(-7600000),
      {
        routes: [
          { pools: [{ id: "1", tokenOutDenom: "uusdc" }], tokenInAmount: "5" },
        ],
        tokenInCoinMinimalDenom: "uosmo",
        tokenOutMinAmount: "1",
      },
      [
        { denom: "uosmo", amount: "0" },
        { denom: "uusdc", amount: "1" },
      ],
      "0",
      "0"
    );
    await (buildMsgs as () => Promise<unknown>)();

    expect(makeCreatePositionMsg).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tokensProvided: [{ denom: "uusdc", amount: "1" }],
      })
    );
  });
});
