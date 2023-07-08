/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Dec, Int } from "@keplr-wallet/unit";
import { maxTick, minTick } from "@osmosis-labs/math";
import {
  calcAmount0Delta,
  calcAmount1Delta,
  tickToSqrtPrice,
} from "@osmosis-labs/math/src/pool/concentrated";
import { makeSwapStrategy } from "@osmosis-labs/math/src/pool/concentrated/swap-strategy";
import {
  ConcentratedLiquidityPool,
  NotEnoughLiquidityError,
} from "@osmosis-labs/pools";

import {
  chainId,
  getAmountsTransferredMapFromEvent as getAmountsTransferredMapFromEventAttributes,
  getAttributeFromEvent,
  getEventFromTx,
  getLatestQueryPool,
  initAccount,
  RootStore,
  waitAccountLoaded,
} from "../../__tests_e2e__/test-env";
import { ObservableQueryPool } from "../../queries";

type Range = {
  lowerTick: Int;
  upperTick: Int;
  liquidity: Dec;
};

type EstimateResult = {
  amountIn: Dec;
  amountOut: Dec;
};

describe("Test Swap Exact In - Concentrated Liquidity", () => {
  const { accountStore, queriesStore, chainStore } = new RootStore();
  let account: ReturnType<(typeof accountStore)["getWallet"]>;
  let queryPool: ObservableQueryPool | undefined;

  const uion = "uion";
  const uosmo = "uosmo";

  const defaultTokenInDenom = uosmo;
  const defaultTokenOutDenom = uion;

  const defaultLPAmount = "1000";

  const spreadFactor = new Dec("0.001");

  beforeAll(async () => {
    await initAccount(accountStore, chainId);
    account = accountStore.getWallet(chainId);
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
    // And prepare the pool
    await new Promise<void>((resolve, reject) => {
      account!.osmosis
        .sendCreateConcentratedPoolMsg(
          "uion",
          "uosmo",
          1,
          0.001, // must have spread factor to generate fees
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
          }
        )
        .catch(reject); // catch broadcast error
    });

    queryPool = await getLatestQueryPool(chainId, queriesStore);
  });

  describe("Positions above current tick 0 (swapping one for zero, right)", () => {
    const defaultTokenInAmount = "10";
    const defaultTokenInAmountInt = new Int(defaultTokenInAmount);

    it("swap across multiple initialized ticks near max spot price", async () => {
      // max tick - arbitrary number
      // 337784849
      const narrowRangeBase = 342000000 - 4215151;

      // N.B. nr stands for "narrow range". Shortened for brevity.
      const nr1Lower = new Int(narrowRangeBase);
      const nr1Upper = new Int(narrowRangeBase + 6);

      const nr2Lower = new Int(narrowRangeBase + 1);
      const nr2Upper = new Int(narrowRangeBase + 5);

      // 337784851
      const nr3Lower = new Int(narrowRangeBase + 2);
      const nr3Upper = new Int(narrowRangeBase + 4);

      let tx = await createPosition();

      const fullRangeLiquidity = getLiquidityDecFromEvent(tx);

      tx = await createPosition(nr1Lower, nr1Upper);
      const nr1Liquidity = getLiquidityDecFromEvent(tx);

      tx = await createPosition(nr2Lower, nr2Upper);
      const nr2Liquidity = getLiquidityDecFromEvent(tx);

      tx = await createPosition(nr3Lower, nr3Upper);
      const nr3Liquidity = getLiquidityDecFromEvent(tx);

      // Liquidity layout in the pool for this test.
      const ranges: Range[] = [
        {
          lowerTick: new Int(0),
          upperTick: nr1Lower,
          liquidity: fullRangeLiquidity,
        },
        {
          lowerTick: nr1Lower,
          upperTick: nr2Lower,
          liquidity: fullRangeLiquidity.add(nr1Liquidity),
        },
        {
          lowerTick: nr2Lower,
          upperTick: nr3Lower,
          liquidity: fullRangeLiquidity.add(nr1Liquidity).add(nr2Liquidity),
        },
        {
          lowerTick: nr3Lower,
          upperTick: nr3Upper,
          liquidity: fullRangeLiquidity
            .add(nr1Liquidity)
            .add(nr2Liquidity)
            .add(nr3Liquidity),
        },
        {
          lowerTick: nr3Upper,
          upperTick: nr2Upper,
          liquidity: fullRangeLiquidity.add(nr1Liquidity).add(nr2Liquidity),
        },
      ];

      // Swap arbitrary small amount
      const tokenInAmount = new Int(1000);

      const tokenOutTotal = estimateSwapExactAmountOutGivenIn(
        tokenInAmount,
        ranges
      );

      // Get quote
      const quote = await (
        queryPool!.pool as ConcentratedLiquidityPool
      ).getTokenOutByTokenIn(
        { denom: defaultTokenInDenom, amount: tokenInAmount },
        defaultTokenOutDenom
      );

      tokenOutTotal.truncate();

      // Validate results
      validateAmounts(tokenOutTotal.truncate(), quote.amount);

      // Estimate fee charge to one of the ticks
      const expectedAmountsToNR2Upper = estimateAmountZeroOutAndInToTick(
        nr2Upper,
        ranges
      );

      const amountOutNR2UpperInt =
        expectedAmountsToNR2Upper.amountOut.truncate();
      const amountInNR2UpperInt = expectedAmountsToNR2Upper.amountIn.truncate();

      // Run quote estimation logic
      const actualAmountNR2Upper = await (
        queryPool!.pool as ConcentratedLiquidityPool
      ).getTokenOutByTokenIn(
        {
          denom: defaultTokenInDenom,
          amount: amountInNR2UpperInt,
        },
        defaultTokenOutDenom
      );

      // Validate results
      validateAmounts(amountOutNR2UpperInt, actualAmountNR2Upper.amount);

      // Swap in using quoted amount
      tx = await swapExactIn(
        defaultTokenInDenom,
        defaultTokenOutDenom,
        amountInNR2UpperInt.toString(),
        actualAmountNR2Upper.amount.toString()
      );

      // Validate amounts
      validateAmountsFromTxEvents(
        tx,
        amountInNR2UpperInt,
        amountOutNR2UpperInt
      );
    });

    it("handles basic swap in the direction with liqudity, ofz (right)", async () => {
      await createDefaultValidPositions(new Int(150), new Int(151));

      // get quote
      const quote = await (
        queryPool!.pool as ConcentratedLiquidityPool
      ).getTokenOutByTokenIn(
        { denom: defaultTokenInDenom, amount: defaultTokenInAmountInt },
        defaultTokenOutDenom
      );

      // swap in using quote
      const tx = await swapExactIn(
        defaultTokenInDenom,
        defaultTokenOutDenom,
        defaultTokenInAmount,
        quote.amount.toString()
      );

      // Validate amounts
      validateAmountsFromTxEvents(tx, defaultTokenInAmountInt, quote.amount);
    });

    it("swap in the direction with far away liqudity with full range position existing, ofz (right)", async () => {
      await createDefaultValidPositions(maxTick.sub(new Int(100)), maxTick);

      const quote = await (
        queryPool!.pool as ConcentratedLiquidityPool
      ).getTokenOutByTokenIn(
        { denom: defaultTokenInDenom, amount: defaultTokenInAmountInt },
        defaultTokenOutDenom
      );

      const tx = await swapExactIn(
        defaultTokenInDenom,
        defaultTokenOutDenom,
        defaultTokenInAmount,
        quote.amount.toString()
      );

      // Validate amounts
      validateAmountsFromTxEvents(tx, defaultTokenInAmountInt, quote.amount);
    });

    it("swap in the direction with far away liqudity with NO full range position existing, ofz (right)", async () => {
      // creating positions with same initial amounts makes current tick be zero
      await createPosition(new Int(2000000), maxTick, "1000000", "1000000");

      const tokenInAmount = new Int(1000000);

      const amountOut = await (
        queryPool!.pool as ConcentratedLiquidityPool
      ).getTokenOutByTokenIn(
        { denom: defaultTokenInDenom, amount: tokenInAmount },
        defaultTokenOutDenom
      );

      const tx = await swapExactIn(
        defaultTokenInDenom,
        defaultTokenOutDenom,
        tokenInAmount.toString(),
        amountOut.amount.toString()
      );

      // Validate amounts
      validateAmountsFromTxEvents(tx, tokenInAmount, amountOut.amount);
    });

    it("swap in the direction with far away liqudity with NO full range position existing, ofz (right) (fails due to lack of precision, needs fixing)", async () => {
      // creating positions with same initial amounts makes current tick be zero
      await createPosition(
        maxTick.sub(new Int(1000)),
        maxTick,
        defaultLPAmount,
        defaultLPAmount
      );

      try {
        await (
          queryPool!.pool as ConcentratedLiquidityPool
        ).getTokenOutByTokenIn(
          { denom: defaultTokenInDenom, amount: defaultTokenInAmountInt },
          defaultTokenOutDenom
        );
      } catch (e: any) {
        // Note, this should not happen and is likely due to the lack of precision.
        // This test should be fixed once precision is increased.
        expect(e.message).toContain(
          "Failed to advance the swap step while estimating slippage bound"
        );
      }
    });

    it("swap fails due to not getting more than 1 unit out (error needs changing)", async () => {
      // creating positions with same initial amounts makes current tick be zero
      await createPosition(
        new Int(142000000),
        maxTick,
        defaultLPAmount,
        defaultLPAmount
      );

      try {
        await (
          queryPool!.pool as ConcentratedLiquidityPool
        ).getTokenOutByTokenIn(
          { denom: defaultTokenInDenom, amount: defaultTokenInAmountInt },
          defaultTokenOutDenom
        );
      } catch (e: any) {
        // Need to change to a new "NotEnoughTokenOutError": https://app.clickup.com/t/862k3p20d
        expect(e instanceof NotEnoughLiquidityError).toBeTruthy();
      }
    });

    it("swap in the direction with far away liqudity with full range position existing, ofz (right)", async () => {
      await createDefaultValidPositions(maxTick.sub(new Int(100)), maxTick);

      const quote = await (
        queryPool!.pool as ConcentratedLiquidityPool
      ).getTokenOutByTokenIn(
        { denom: defaultTokenInDenom, amount: defaultTokenInAmountInt },
        defaultTokenOutDenom
      );

      const tx = await swapExactIn(
        defaultTokenInDenom,
        defaultTokenOutDenom,
        defaultTokenInAmount,
        quote.amount.toString()
      );

      // Validate amounts
      validateAmountsFromTxEvents(tx, defaultTokenInAmountInt, quote.amount);
    });

    it("fails to swap in the direction where no liquidity exists ", async () => {
      try {
        await (
          queryPool!.pool as ConcentratedLiquidityPool
        ).getTokenOutByTokenIn(
          { denom: defaultTokenInDenom, amount: defaultTokenInAmountInt },
          defaultTokenOutDenom
        );
        fail("should have thrown");
      } catch (e) {
        // expected as there is no liquidity
      }
    });
  });

  /** Create position with current pool. Default full range. */
  function createPosition(
    minTick_ = minTick,
    maxTick_ = maxTick,
    osmoAmount = "1000",
    ionAmount = "1000"
  ) {
    const osmoCurrency = chainStore
      .getChain(chainId)
      .forceFindCurrency("uosmo");
    const ionCurrency = chainStore.getChain(chainId).forceFindCurrency("uion");

    // prepare CL position
    return new Promise<any>((resolve, reject) => {
      account!.osmosis
        .sendCreateConcentratedLiquidityPositionMsg(
          queryPool!.id,
          minTick_,
          maxTick_,
          {
            currency: osmoCurrency,
            amount: osmoAmount,
          },
          {
            currency: ionCurrency,
            amount: ionAmount,
          },
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else {
              try {
                queryPool!.waitFreshResponse().then(() => resolve(tx));
              } catch (e) {
                reject(e);
              }
            }
          }
        )
        .catch(reject); // catch broadcast error
    });
  }

  /** Swap through current pool. */
  function swapExactIn(
    tokenInDenom: string,
    tokenOutDenom: string,
    amountIn: string,
    minAmountOut: string
  ) {
    const tokenInCurrency = chainStore
      .getChain(chainId)
      .forceFindCurrency(tokenInDenom);
    return new Promise<any>((resolve, reject) => {
      account!.osmosis
        .sendSwapExactAmountInMsg(
          [{ id: queryPool!.id, tokenOutDenom }],
          {
            currency: tokenInCurrency,
            amount: amountIn,
          },
          minAmountOut,
          undefined,
          undefined,
          undefined,
          undefined,
          (tx: any) => {
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
          }
        )
        .catch(reject);
    });
  }

  // creates 2 positions with default amounts:
  // 1. full range
  // 2. narrow range with given ticks.
  async function createDefaultValidPositions(
    secondPositionLowerTick: Int,
    secondPositionUpperTick: Int
  ) {
    // create full range, otherwise it currently cannot estimate due to zero liquidity
    // at current tick
    await createPosition();
    // creating positions with same initial amounts makes current tick be zero
    await createPosition(
      secondPositionLowerTick,
      secondPositionUpperTick,
      defaultLPAmount,
      defaultLPAmount
    );
  }

  function getLiquidityDecFromEvent(tx: any) {
    const event = getEventFromTx(tx, "create_position");
    return new Dec(getAttributeFromEvent(event, "liquidity").value);
  }

  // note: correctness of strategy is assume
  function estimateSwapExactAmountOutGivenIn(
    tokenInAmount: Int,
    ranges: Range[]
  ) {
    // estimate quote
    const strategy = makeSwapStrategy(
      true,
      tickToSqrtPrice(maxTick),
      spreadFactor
    );

    let tokenInAmountRemainingDec = tokenInAmount.toDec();
    let tokenOutTotal = new Dec(0);
    for (
      let i = 0;
      i < ranges.length && tokenInAmountRemainingDec.gt(new Dec(0));
      i++
    ) {
      const range = ranges[i];
      const { amountInConsumed, amountOutComputed, feeChargeTotal } =
        strategy.computeSwapStepOutGivenIn(
          tickToSqrtPrice(range.lowerTick),
          tickToSqrtPrice(range.upperTick),
          range.liquidity,
          tokenInAmountRemainingDec
        );

      tokenInAmountRemainingDec = tokenInAmountRemainingDec
        .sub(amountInConsumed)
        .sub(feeChargeTotal);
      tokenOutTotal = tokenOutTotal.add(amountOutComputed);
    }

    return tokenOutTotal;
  }

  // Estimates amount zero out and amount one in necessary to swap to a specific tick
  // Note: correctness of strategy is assumed
  function estimateAmountZeroOutAndInToTick(
    tickToSwapTo: Int,
    ranges: Range[]
  ) {
    // estimate quote
    let tokenOutTotal = new Dec(0);
    let tokenInTotal = new Dec(0);
    for (
      let i = 0;
      i < ranges.length && ranges[i].lowerTick < tickToSwapTo;
      i++
    ) {
      const range = ranges[i];

      const amountZeroOut = calcAmount0Delta(
        range.liquidity,
        tickToSqrtPrice(range.lowerTick),
        tickToSqrtPrice(range.upperTick),
        false
      );

      const amountOneIn = calcAmount1Delta(
        range.liquidity,
        tickToSqrtPrice(range.lowerTick),
        tickToSqrtPrice(range.upperTick),
        true
      );

      // fee charge
      const feeCharge = amountOneIn
        .mul(spreadFactor)
        .quo(new Dec(1).sub(spreadFactor));

      tokenOutTotal = tokenOutTotal.add(amountZeroOut);
      tokenInTotal = tokenInTotal.add(amountOneIn).add(feeCharge);
    }

    const result: EstimateResult = {
      amountIn: tokenInTotal,
      amountOut: tokenOutTotal,
    };

    return result;
  }

  function validateAmounts(actualAmount: Int, expectedAmount: Int) {
    if (!expectedAmount.equals(actualAmount)) {
      throw new Error(
        "amount mismatch " +
          actualAmount.toString() +
          " != " +
          expectedAmount.toString()
      );
    }
  }

  // returns map of amountsIn and Out by denom from tx's events
  function getActualAmountFromTx(tx: any) {
    // validate swap event
    const swapEvent = getEventFromTx(tx, "transfer");

    // filter token trasfers and get amounts by denom
    const transferAttributes = swapEvent.attributes.filter(
      (attr: any) => attr.key == "amount"
    );
    const actualAmountsMapByDenom =
      getAmountsTransferredMapFromEventAttributes(transferAttributes);

    return actualAmountsMapByDenom;
  }

  function validateAmountsFromTxEvents(
    tx: any,
    tokenInAmount: Int,
    amountOut: Int
  ) {
    const actualAmountsMapByDenom = getActualAmountFromTx(tx);

    // Validate amounts in
    validateAmounts(
      tokenInAmount,
      actualAmountsMapByDenom.get(defaultTokenInDenom)!
    );

    // Validate amounts out
    validateAmounts(
      amountOut,
      actualAmountsMapByDenom.get(defaultTokenOutDenom)!
    );
  }
});
