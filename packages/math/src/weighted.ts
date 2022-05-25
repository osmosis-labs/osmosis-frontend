import {
  Dec,
  DecUtils,
  Int,
  IntPretty,
  Coin,
  CoinPretty,
} from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";

export class WeightedPoolMath {
  protected static oneDec = new Dec(1);
  protected static twoDec = new Dec(2);
  protected static zeroInt = new Int(0);
  protected static twoInt = new Int(2);
  protected static powPrecision = new Dec("0.00000001");

  public static calcSlippageTokenIn(
    spotPriceBefore: Dec,
    tokenIn: Int,
    slippage: Dec
  ): Int {
    const effectivePrice = spotPriceBefore.mul(slippage.add(new Dec(1)));
    return new Dec(tokenIn).quo(effectivePrice).truncate();
  }

  public static calcSlippageTokenOut(
    spotPriceBefore: Dec,
    tokenOut: Int,
    slippage: Dec
  ): Int {
    const effectivePrice = spotPriceBefore.mul(slippage.add(new Dec(1)));
    return new Dec(tokenOut).mul(effectivePrice).truncate();
  }

  public static calcSlippageSlope(
    tokenBalanceIn: Dec,
    tokenWeightIn: Dec,
    tokenWeightOut: Dec,
    swapFee: Dec
  ): Dec {
    return WeightedPoolMath.oneDec
      .sub(swapFee)
      .mul(tokenWeightIn.add(tokenWeightOut))
      .sub(WeightedPoolMath.twoDec.mul(tokenBalanceIn).mul(tokenWeightOut));
  }

  public static calcSpotPrice(
    tokenBalanceIn: Dec,
    tokenWeightIn: Dec,
    tokenBalanceOut: Dec,
    tokenWeightOut: Dec,
    swapFee: Dec
  ): Dec {
    const number = tokenBalanceIn.quo(tokenWeightIn);
    const denom = tokenBalanceOut.quo(tokenWeightOut);
    const scale = WeightedPoolMath.oneDec.quo(
      WeightedPoolMath.oneDec.sub(swapFee)
    );

    return number.quo(denom).mul(scale);
  }

  public static calcOutGivenIn(
    tokenBalanceIn: Dec,
    tokenWeightIn: Dec,
    tokenBalanceOut: Dec,
    tokenWeightOut: Dec,
    tokenAmountIn: Dec,
    swapFee: Dec
  ): Dec {
    const weightRatio = tokenWeightIn.quo(tokenWeightOut);
    let adjustedIn = WeightedPoolMath.oneDec.sub(swapFee);
    adjustedIn = tokenAmountIn.mul(adjustedIn);
    const y = tokenBalanceIn.quo(tokenBalanceIn.add(adjustedIn));
    const foo = WeightedPoolMath.pow(y, weightRatio);
    const bar = WeightedPoolMath.oneDec.sub(foo);
    return tokenBalanceOut.mul(bar);
  }

  public static calcInGivenOut(
    tokenBalanceIn: Dec,
    tokenWeightIn: Dec,
    tokenBalanceOut: Dec,
    tokenWeightOut: Dec,
    tokenAmountOut: Dec,
    swapFee: Dec
  ): Dec {
    const weightRatio = tokenWeightOut.quo(tokenWeightIn);
    const diff = tokenBalanceOut.sub(tokenAmountOut);
    const y = tokenBalanceOut.quo(diff);
    let foo = WeightedPoolMath.pow(y, weightRatio);
    foo = foo.sub(WeightedPoolMath.oneDec);
    const tokenAmountIn = WeightedPoolMath.oneDec.sub(swapFee);
    return tokenBalanceIn.mul(foo).quo(tokenAmountIn);
  }

  public static calcPoolOutGivenSingleIn(
    tokenBalanceIn: Dec,
    tokenWeightIn: Dec,
    poolSupply: Dec,
    totalWeight: Dec,
    tokenAmountIn: Dec,
    swapFee: Dec
  ): Dec {
    const normalizedWeight = tokenWeightIn.quo(totalWeight);
    const zaz = WeightedPoolMath.oneDec.sub(normalizedWeight).mul(swapFee);
    const tokenAmountInAfterFee = tokenAmountIn.mul(
      WeightedPoolMath.oneDec.sub(zaz)
    );

    const newTokenBalanceIn = tokenBalanceIn.add(tokenAmountInAfterFee);
    const tokenInRatio = newTokenBalanceIn.quo(tokenBalanceIn);

    // uint newPoolSupply = (ratioTi ^ weightTi) * poolSupply;
    const poolRatio = WeightedPoolMath.pow(tokenInRatio, normalizedWeight);
    const newPoolSupply = poolRatio.mul(poolSupply);
    return newPoolSupply.sub(poolSupply);
  }

  public static calcSingleInGivenPoolOut(
    tokenBalanceIn: Dec,
    tokenWeightIn: Dec,
    poolSupply: Dec,
    totalWeight: Dec,
    poolAmountOut: Dec,
    swapFee: Dec
  ): Dec {
    const normalizedWeight = tokenWeightIn.quo(totalWeight);
    const newPoolSupply = poolSupply.add(poolAmountOut);
    const poolRatio = newPoolSupply.quo(poolSupply);

    //uint newBalTi = poolRatio^(1/weightTi) * balTi;
    const boo = WeightedPoolMath.oneDec.quo(normalizedWeight);
    const tokenInRatio = WeightedPoolMath.pow(poolRatio, boo);
    const newTokenBalanceIn = tokenInRatio.mul(tokenBalanceIn);
    const tokenAmountInAfterFee = newTokenBalanceIn.sub(tokenBalanceIn);
    // Do reverse order of fees charged in joinswap_ExternAmountIn, this way
    //     ``` pAo == joinswap_ExternAmountIn(Ti, joinswap_PoolAmountOut(pAo, Ti)) ```
    //uint tAi = tAiAfterFee / (1 - (1-weightTi) * swapFee) ;
    const zar = WeightedPoolMath.oneDec.sub(normalizedWeight).mul(swapFee);
    return tokenAmountInAfterFee.quo(WeightedPoolMath.oneDec.sub(zar));
  }

  public static calcSingleOutGivenPoolIn(
    tokenBalanceOut: Dec,
    tokenWeightOut: Dec,
    poolSupply: Dec,
    totalWeight: Dec,
    poolAmountIn: Dec,
    swapFee: Dec
  ): Dec {
    const normalizedWeight = tokenWeightOut.quo(totalWeight);
    // charge exit fee on the pool token side
    // pAiAfterExitFee = pAi*(1-exitFee)
    const poolAmountInAfterExitFee = poolAmountIn.mul(WeightedPoolMath.oneDec);
    const newPoolSupply = poolSupply.sub(poolAmountInAfterExitFee);
    const poolRatio = newPoolSupply.quo(poolSupply);

    // newBalTo = poolRatio^(1/weightTo) * balTo;

    const tokenOutRatio = WeightedPoolMath.pow(
      poolRatio,
      WeightedPoolMath.oneDec.quo(normalizedWeight)
    );
    const newTokenBalanceOut = tokenOutRatio.mul(tokenBalanceOut);

    const tokenAmountOutBeforeSwapFee = tokenBalanceOut.sub(newTokenBalanceOut);

    // charge swap fee on the output token side
    //uint tAo = tAoBeforeSwapFee * (1 - (1-weightTo) * swapFee)
    const zaz = WeightedPoolMath.oneDec.sub(normalizedWeight).mul(swapFee);
    return tokenAmountOutBeforeSwapFee.mul(WeightedPoolMath.oneDec.sub(zaz));
  }

  public static calcPoolInGivenSingleOut(
    tokenBalanceOut: Dec,
    tokenWeightOut: Dec,
    poolSupply: Dec,
    totalWeight: Dec,
    tokenAmountOut: Dec,
    swapFee: Dec
  ): Dec {
    // charge swap fee on the output token side
    const normalizedWeight = tokenWeightOut.quo(totalWeight);
    //uint tAoBeforeSwapFee = tAo / (1 - (1-weightTo) * swapFee) ;
    const zoo = WeightedPoolMath.oneDec.sub(normalizedWeight);
    const zar = zoo.mul(swapFee);
    const tokenAmountOutBeforeSwapFee = tokenAmountOut.quo(
      WeightedPoolMath.oneDec.sub(zar)
    );

    const newTokenBalanceOut = tokenBalanceOut.sub(tokenAmountOutBeforeSwapFee);
    const tokenOutRatio = newTokenBalanceOut.quo(tokenBalanceOut);

    //uint newPoolSupply = (ratioTo ^ weightTo) * poolSupply;
    const poolRatio = WeightedPoolMath.pow(tokenOutRatio, normalizedWeight);
    const newPoolSupply = poolRatio.mul(poolSupply);
    const poolAmountInAfterExitFee = poolSupply.sub(newPoolSupply);

    // charge exit fee on the pool token side
    // pAi = pAiAfterExitFee/(1-exitFee)
    return poolAmountInAfterExitFee.quo(WeightedPoolMath.oneDec);
  }

  public static pow(base: Dec, exp: Dec): Dec {
    // Exponentiation of a negative base with an arbitrary real exponent is not closed within the reals.
    // You can see this by recalling that `i = (-1)^(.5)`. We have to go to complex numbers to define this.
    // (And would have to implement complex logarithms)
    // We don't have a need for negative bases, so we don't include any such logic.
    if (!base.isPositive()) {
      throw new Error("base must be greater than 0");
    }
    // TODO: Remove this if we want to generalize the function,
    // we can adjust the algorithm in this setting.
    if (base.gte(new Dec("2"))) {
      throw new Error("base must be lesser than two");
    }

    // We will use an approximation algorithm to compute the power.
    // Since computing an integer power is easy, we split up the exponent into
    // an integer component and a fractional component.
    const integer = exp.truncate();
    const fractional = exp.sub(new Dec(integer));

    const integerPow = WeightedPoolMath.powInt(base, integer);

    if (fractional.isZero()) {
      return integerPow;
    }

    const fractionalPow = WeightedPoolMath.powApprox(
      base,
      fractional,
      WeightedPoolMath.powPrecision
    );

    return integerPow.mul(fractionalPow);
  }

  protected static powInt(base: Dec, power: Int): Dec {
    if (power.equals(WeightedPoolMath.zeroInt)) {
      return WeightedPoolMath.oneDec;
    }
    let tmp = WeightedPoolMath.oneDec;

    for (let i = power; i.gt(new Int(1)); ) {
      if (!i.mod(WeightedPoolMath.twoInt).equals(WeightedPoolMath.zeroInt)) {
        tmp = tmp.mul(base);
      }
      i = i.div(WeightedPoolMath.twoInt);
      base = base.mul(base);
    }

    return base.mul(tmp);
  }

  protected static absDifferenceWithSign(a: Dec, b: Dec): [Dec, boolean] {
    if (a.gte(b)) {
      return [a.sub(b), false];
    } else {
      return [b.sub(a), true];
    }
  }

  protected static powApprox(base: Dec, exp: Dec, precision: Dec): Dec {
    if (exp.isZero()) {
      return new Dec(0);
    }

    const a = exp;
    const [x, xneg] = WeightedPoolMath.absDifferenceWithSign(
      base,
      WeightedPoolMath.oneDec
    );
    let term = WeightedPoolMath.oneDec;
    let sum = WeightedPoolMath.oneDec;
    let negative = false;

    // TODO: Document this computation via taylor expansion
    for (let i = 1; term.gte(precision); i++) {
      const bigK = WeightedPoolMath.oneDec.mul(new Dec(i.toString()));
      const [c, cneg] = WeightedPoolMath.absDifferenceWithSign(
        a,
        bigK.sub(WeightedPoolMath.oneDec)
      );
      term = term.mul(c.mul(x));
      term = term.quo(bigK);

      if (term.isZero()) {
        break;
      }
      if (xneg) {
        negative = !negative;
      }

      if (cneg) {
        negative = !negative;
      }

      if (negative) {
        sum = sum.sub(term);
      } else {
        sum = sum.add(term);
      }
    }
    return sum;
  }
}

export class WeightedPoolEstimates {
  public static estimateJoinSwapExternAmountIn(
    poolAsset: { amount: Int; weight: Int },
    pool: {
      totalShare: Int;
      totalWeight: Int;
      swapFee: Dec;
    },
    tokenIn: {
      currency: { coinDecimals: number; coinMinimalDenom: string };
      amount: string;
    },
    shareCoinDecimals: number
  ): {
    shareOutAmount: IntPretty;
    shareOutAmountRaw: Int;
  } {
    const amount = new Dec(tokenIn.amount)
      .mul(
        DecUtils.getTenExponentNInPrecisionRange(tokenIn.currency.coinDecimals)
      )
      .truncate();
    const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

    const estimated = WeightedPoolEstimates_Raw.estimateJoinSwapExternAmountIn(
      poolAsset,
      pool.totalShare,
      pool.totalWeight,
      coin,
      pool.swapFee
    );

    return {
      shareOutAmount: new IntPretty(
        estimated.shareOutAmount
      ).moveDecimalPointLeft(shareCoinDecimals),
      shareOutAmountRaw: estimated.shareOutAmount,
    };
  }

  public static estimateJoinSwap(
    pool: {
      totalShare: Int;
    },
    poolAssets: { denom: string; amount: Int }[],
    makeCoinPretty: (coin: Coin) => CoinPretty,
    shareOutAmount: string,
    shareCoinDecimals: number
  ): {
    tokenIns: CoinPretty[];
  } {
    const estimated = WeightedPoolEstimates_Raw.estimateJoinPool(
      pool.totalShare,
      poolAssets,
      new Dec(shareOutAmount)
        .mul(DecUtils.getTenExponentNInPrecisionRange(shareCoinDecimals))
        .truncate()
    );

    const tokenIns = estimated.tokenIns.map(makeCoinPretty);

    return {
      tokenIns,
    };
  }

  public static estimateExitSwap(
    pool: {
      totalShare: Int;
      poolAssets: { denom: string; amount: Int }[];
    },
    makeCoinPretty: (coin: Coin) => CoinPretty,
    shareInAmount: string,
    shareCoinDecimals: number
  ): { tokenOuts: CoinPretty[] } {
    const estimated = WeightedPoolEstimates_Raw.estimateExitPool(
      pool.totalShare,
      pool.poolAssets,
      new Dec(shareInAmount)
        .mul(DecUtils.getTenExponentNInPrecisionRange(shareCoinDecimals))
        .truncate()
    );

    const tokenOuts = estimated.tokenOuts.map(makeCoinPretty);

    return {
      tokenOuts,
    };
  }

  public static estimateSwapExactAmountIn(
    pool: {
      inPoolAsset: {
        coinDecimals: number;
        coinMinimalDenom: string;
        amount: Int;
        weight: Int;
      };
      outPoolAsset: { amount: Int; weight: Int };
      swapFee: Dec;
    },
    tokenIn: Coin,
    tokenOutCurrency: Currency
  ): {
    tokenOut: CoinPretty;
    spotPriceBefore: IntPretty;
    spotPriceAfter: IntPretty;
    slippage: IntPretty;
    raw: ReturnType<typeof WeightedPoolEstimates_Raw.estimateSwapExactAmountIn>;
  } {
    const estimated = WeightedPoolEstimates_Raw.estimateSwapExactAmountIn(
      pool.inPoolAsset,
      pool.outPoolAsset,
      tokenIn,
      pool.swapFee
    );

    const tokenOut = new CoinPretty(tokenOutCurrency, estimated.tokenOutAmount);
    const spotPriceBefore = new IntPretty(estimated.spotPriceBefore)
      .maxDecimals(4)
      .trim(true);
    const spotPriceAfter = new IntPretty(estimated.spotPriceAfter)
      .maxDecimals(4)
      .trim(true);

    const slippage = new IntPretty(estimated.slippage)
      .moveDecimalPointRight(2)
      .maxDecimals(4)
      .trim(true);

    return {
      tokenOut,
      spotPriceBefore,
      spotPriceAfter,
      slippage,
      raw: estimated,
    };
  }

  public static estimateSwapExactAmountOut(
    pool: {
      inPoolAsset: {
        coinDecimals: number;
        coinMinimalDenom: string;
        amount: Int;
        weight: Int;
      };
      outPoolAsset: { amount: Int; weight: Int };
      swapFee: Dec;
    },
    tokenOut: Coin,
    tokenInCurrency: Currency
  ): {
    tokenIn: CoinPretty;
    spotPriceBefore: IntPretty;
    spotPriceAfter: IntPretty;
    slippage: IntPretty;
    raw: ReturnType<
      typeof WeightedPoolEstimates_Raw.estimateSwapExactAmountOut
    >;
  } {
    const estimated = WeightedPoolEstimates_Raw.estimateSwapExactAmountOut(
      pool.inPoolAsset,
      pool.outPoolAsset,
      tokenOut,
      pool.swapFee
    );

    const tokenIn = new CoinPretty(tokenInCurrency, estimated.tokenInAmount);
    const spotPriceBefore = new IntPretty(estimated.spotPriceBefore)
      .maxDecimals(4)
      .trim(true);
    const spotPriceAfter = new IntPretty(estimated.spotPriceAfter)
      .maxDecimals(4)
      .trim(true);

    const slippage = new IntPretty(estimated.slippage)
      .moveDecimalPointRight(2)
      .maxDecimals(4)
      .trim(true);

    return {
      tokenIn,
      spotPriceBefore,
      spotPriceAfter,
      slippage,
      raw: estimated,
    };
  }

  public static estimateMultihopSwapExactAmountIn(
    tokenIn: { currency: Currency; amount: string },
    routes: {
      pool: {
        inPoolAsset: {
          coinDecimals: number;
          coinMinimalDenom: string;
          amount: Int;
          weight: Int;
        };
        outPoolAsset: { amount: Int; weight: Int };
        swapFee: Dec;
      };
      tokenOutCurrency: Currency;
    }[]
  ): {
    tokenOut: CoinPretty;
    spotPriceBeforeRaw: Dec;
    spotPriceBefore: IntPretty;
    spotPriceAfter: IntPretty;
    slippage: IntPretty;
  } {
    if (routes.length === 0) {
      throw new Error("Empty route");
    }

    let spotPriceBeforeRaw = new Dec(1);
    let spotPriceBefore = new IntPretty(new Dec(1));
    let spotPriceAfter = new IntPretty(new Dec(1));

    const originalTokenIn = { ...tokenIn };

    for (const route of routes) {
      const estimated = WeightedPoolEstimates.estimateSwapExactAmountIn(
        route.pool,
        new Coin(tokenIn.currency.coinMinimalDenom, tokenIn.amount),
        route.tokenOutCurrency
      );

      spotPriceBeforeRaw = spotPriceBeforeRaw.mul(
        estimated.raw.spotPriceBefore
      );
      spotPriceBefore = spotPriceBefore
        .mul(estimated.spotPriceBefore)
        .quo(
          DecUtils.getTenExponentNInPrecisionRange(
            tokenIn.currency.coinDecimals - route.tokenOutCurrency.coinDecimals
          )
        );
      spotPriceAfter = spotPriceAfter
        .mul(estimated.spotPriceAfter)
        .quo(
          DecUtils.getTenExponentNInPrecisionRange(
            tokenIn.currency.coinDecimals - route.tokenOutCurrency.coinDecimals
          )
        );

      // Token out should be the token in for the next route
      tokenIn = {
        currency: route.tokenOutCurrency,
        amount: estimated.tokenOut
          .moveDecimalPointRight(route.tokenOutCurrency.coinDecimals)
          .trim(true)
          .locale(false)
          .hideDenom(true)
          .toString(),
      };
    }

    const effectivePrice = new Dec(originalTokenIn.amount).quo(
      new Dec(tokenIn.amount)
    );
    const slippage = effectivePrice
      .quo(spotPriceBefore.toDec())
      .sub(new Dec("1"));

    return {
      spotPriceBeforeRaw,
      spotPriceBefore,
      spotPriceAfter,
      tokenOut: new CoinPretty(
        tokenIn.currency,
        new Dec(tokenIn.amount).mul(
          DecUtils.getTenExponentNInPrecisionRange(
            tokenIn.currency.coinDecimals
          )
        )
      ),
      slippage: new IntPretty(slippage)
        .moveDecimalPointRight(2)
        .maxDecimals(4)
        .trim(true),
    };
  }
}

class WeightedPoolEstimates_Raw {
  public static estimateSwapExactAmountIn(
    inPoolAsset: { amount: Int; weight: Int },
    outPoolAsset: { amount: Int; weight: Int },
    tokenIn: Coin,
    swapFee: Dec
  ): {
    tokenOutAmount: Int;
    spotPriceBefore: Dec;
    spotPriceAfter: Dec;
    slippage: Dec;
  } {
    const spotPriceBefore = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      swapFee
    );

    const tokenOutAmount = WeightedPoolMath.calcOutGivenIn(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      new Dec(tokenIn.amount),
      swapFee
    ).truncate();

    const spotPriceAfter = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount).add(new Dec(tokenIn.amount)),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount).sub(new Dec(tokenOutAmount)),
      new Dec(outPoolAsset.weight),
      swapFee
    );
    if (spotPriceAfter.lt(spotPriceBefore)) {
      throw new Error("spot price can't be decreased after swap");
    }

    const effectivePrice = new Dec(tokenIn.amount).quo(new Dec(tokenOutAmount));
    const slippage = effectivePrice.quo(spotPriceBefore).sub(new Dec("1"));

    return {
      tokenOutAmount,
      spotPriceBefore,
      spotPriceAfter,
      slippage,
    };
  }

  public static estimateSwapExactAmountOut(
    inPoolAsset: { amount: Int; weight: Int },
    outPoolAsset: { amount: Int; weight: Int },
    tokenOut: Coin,
    swapFee: Dec
  ): {
    tokenInAmount: Int;
    spotPriceBefore: Dec;
    spotPriceAfter: Dec;
    slippage: Dec;
  } {
    const spotPriceBefore = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      swapFee
    );

    const tokenInAmount = WeightedPoolMath.calcInGivenOut(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      new Dec(tokenOut.amount),
      swapFee
    ).truncate();

    const spotPriceAfter = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount).add(new Dec(tokenInAmount)),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount).sub(new Dec(tokenOut.amount)),
      new Dec(outPoolAsset.weight),
      swapFee
    );

    if (spotPriceAfter.lt(spotPriceBefore)) {
      throw new Error("spot price can't be decreased after swap");
    }

    const effectivePrice = new Dec(tokenInAmount).quo(new Dec(tokenOut.amount));
    const slippage = effectivePrice.quo(spotPriceBefore).sub(new Dec("1"));

    return {
      tokenInAmount,
      spotPriceBefore,
      spotPriceAfter,
      slippage,
    };
  }

  public static estimateJoinPool(
    totalShare: Int,
    poolAssets: { denom: string; amount: Int }[],
    shareOutAmount: Int
  ): {
    tokenIns: Coin[];
  } {
    const tokenIns: Coin[] = [];

    const shareRatio = new Dec(shareOutAmount).quo(new Dec(totalShare));
    if (shareRatio.lte(new Dec(0))) {
      throw new Error("share ratio is zero or negative");
    }

    for (const poolAsset of poolAssets) {
      const tokenInAmount = shareRatio
        .mul(new Dec(poolAsset.amount))
        .truncate();

      tokenIns.push(new Coin(poolAsset.denom, tokenInAmount));
    }

    return {
      tokenIns,
    };
  }

  public static estimateExitPool(
    totalShare: Int,
    poolAssets: { denom: string; amount: Int }[],
    shareInAmount: Int
  ): {
    tokenOuts: Coin[];
  } {
    const tokenOuts: Coin[] = [];

    const shareRatio = new Dec(shareInAmount).quo(new Dec(totalShare));
    if (shareRatio.lte(new Dec(0))) {
      throw new Error("share ratio is zero or negative");
    }

    for (const poolAsset of poolAssets) {
      const tokenOutAmount = shareRatio
        .mul(new Dec(poolAsset.amount))
        .truncate();

      tokenOuts.push(new Coin(poolAsset.denom, tokenOutAmount));
    }

    return {
      tokenOuts,
    };
  }

  public static estimateJoinSwapExternAmountIn(
    poolAsset: { amount: Int; weight: Int },
    totalShare: Int,
    totalWeight: Int,
    tokenIn: Coin,
    swapFee: Dec
  ): {
    shareOutAmount: Int;
  } {
    const shareOutAmount = WeightedPoolMath.calcPoolOutGivenSingleIn(
      new Dec(poolAsset.amount),
      new Dec(poolAsset.weight),
      new Dec(totalShare),
      new Dec(totalWeight),
      tokenIn.amount.toDec(),
      swapFee
    ).truncate();

    return {
      shareOutAmount,
    };
  }

  public static calculateMinTokenOutByTokenInWithSlippage(
    beforeSpotPriceInOverOut: Dec,
    tokenInAmount: Int,
    slippage: Dec
  ): Int {
    const expectedEffectivePriceInOverOut =
      beforeSpotPriceInOverOut.mulTruncate(new Dec(1).add(slippage));

    return new Dec(1)
      .quoTruncate(expectedEffectivePriceInOverOut)
      .mulTruncate(tokenInAmount.toDec())
      .truncate();
  }

  public static calculateMaxTokenInByTokenOutWithSlippage(
    beforeSpotPriceInOverOut: Dec,
    tokenOutAmount: Int,
    slippage: Dec
  ): Int {
    const expectedEffectivePriceInOverOut =
      beforeSpotPriceInOverOut.mulTruncate(new Dec(1).add(slippage));

    return expectedEffectivePriceInOverOut
      .mulTruncate(tokenOutAmount.toDec())
      .truncate();
  }
}
