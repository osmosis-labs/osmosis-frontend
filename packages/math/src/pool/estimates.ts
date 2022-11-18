import {
  Dec,
  DecUtils,
  Int,
  IntPretty,
  Coin,
  CoinPretty,
} from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import { WeightedPoolMath } from "./weighted";
import { StableSwapMath } from "./stable";

export function estimateJoinSwapExternAmountIn(
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

  const estimated = estimateJoinSwapExternAmountIn_Raw(
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

export function estimateJoinSwap(
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
  const estimated = estimateJoinPool_Raw(
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

export function estimateExitSwap(
  pool: {
    totalShare: Int;
    poolAssets: { denom: string; amount: Int }[];
    exitFee: Dec;
  },
  makeCoinPretty: (coin: Coin) => CoinPretty,
  shareInAmount: string,
  shareCoinDecimals: number
): { tokenOuts: CoinPretty[] } {
  const estimated = estimateExitPool_Raw(
    pool.totalShare,
    pool.poolAssets,
    new Dec(shareInAmount)
      .mul(DecUtils.getTenExponentNInPrecisionRange(shareCoinDecimals))
      .truncate(),
    pool.exitFee
  );

  const tokenOuts = estimated.tokenOuts.map(makeCoinPretty);

  return {
    tokenOuts,
  };
}

export function estimateSwapExactAmountIn(
  pool: {
    inPoolAsset: {
      coinDecimals: number;
      coinMinimalDenom: string;
      amount: Int;
      weight?: Int;
    };
    outPoolAsset: { denom: string; amount: Int; weight?: Int };
    poolAssets: {
      amount: Int;
      denom: string;
      scalingFactor: number;
    }[];
    swapFee: Dec;
  },
  tokenIn: Coin,
  tokenOutCurrency: Currency
): {
  tokenOut: CoinPretty;
  spotPriceBefore: IntPretty;
  spotPriceAfter: IntPretty;
  priceImpact: IntPretty;
  raw: ReturnType<typeof estimateSwapExactAmountIn_Raw>;
} {
  const estimated = estimateSwapExactAmountIn_Raw(
    {
      denom: pool.inPoolAsset.coinMinimalDenom,
      amount: pool.inPoolAsset.amount,
      weight: pool.inPoolAsset.weight,
    },
    {
      denom: pool.outPoolAsset.denom,
      amount: pool.outPoolAsset.amount,
      weight: pool.outPoolAsset.weight,
    },
    pool.poolAssets,
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

  const priceImpact = new IntPretty(estimated.priceImpact)
    .moveDecimalPointRight(2)
    .maxDecimals(4)
    .trim(true);

  return {
    tokenOut,
    spotPriceBefore,
    spotPriceAfter,
    priceImpact,
    raw: estimated,
  };
}

export function estimateSwapExactAmountOut(
  pool: {
    inPoolAsset: {
      coinDecimals: number;
      coinMinimalDenom: string;
      amount: Int;
      weight?: Int;
    };
    outPoolAsset: { denom: string; amount: Int; weight?: Int };
    poolAssets: {
      amount: Int;
      denom: string;
      scalingFactor: number;
    }[];
    swapFee: Dec;
  },
  tokenOut: Coin,
  tokenInCurrency: Currency
): {
  tokenIn: CoinPretty;
  spotPriceBefore: IntPretty;
  spotPriceAfter: IntPretty;
  priceImpact: IntPretty;
  raw: ReturnType<typeof estimateSwapExactAmountOut_Raw>;
} {
  const estimated = estimateSwapExactAmountOut_Raw(
    {
      denom: pool.inPoolAsset.coinMinimalDenom,
      amount: pool.inPoolAsset.amount,
      weight: pool.inPoolAsset.weight,
    },
    {
      denom: pool.outPoolAsset.denom,
      amount: pool.outPoolAsset.amount,
      weight: pool.outPoolAsset.weight,
    },
    pool.poolAssets,
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

  const priceImpact = new IntPretty(estimated.priceImpact)
    .moveDecimalPointRight(2)
    .maxDecimals(4)
    .trim(true);

  return {
    tokenIn,
    spotPriceBefore,
    spotPriceAfter,
    priceImpact,
    raw: estimated,
  };
}

export function estimateMultihopSwapExactAmountIn(
  tokenIn: { currency: Currency; amount: string },
  routes: {
    pool: {
      inPoolAsset: {
        coinDecimals: number;
        coinMinimalDenom: string;
        amount: Int;
        weight?: Int;
      };
      outPoolAsset: { denom: string; amount: Int; weight?: Int };
      poolAssets: {
        amount: Int;
        denom: string;
        scalingFactor: number;
      }[];
      swapFee: Dec;
    };
    tokenOutCurrency: Currency;
  }[]
): {
  tokenOut: CoinPretty;
  spotPriceBeforeRaw: Dec;
  spotPriceBefore: IntPretty;
  spotPriceAfter: IntPretty;
  priceImpact: IntPretty;
} {
  if (routes.length === 0) {
    throw new Error("Empty route");
  }

  let spotPriceBeforeRaw = new Dec(1);
  let spotPriceBefore = new IntPretty(new Dec(1));
  let spotPriceAfter = new IntPretty(new Dec(1));

  const originalTokenIn = { ...tokenIn };

  for (const route of routes) {
    const estimated = estimateSwapExactAmountIn(
      route.pool,
      new Coin(tokenIn.currency.coinMinimalDenom, tokenIn.amount),
      route.tokenOutCurrency
    );

    spotPriceBeforeRaw = spotPriceBeforeRaw.mul(estimated.raw.spotPriceBefore);
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
  const priceImpact = effectivePrice
    .quo(spotPriceBefore.toDec())
    .sub(new Dec("1"));

  return {
    spotPriceBeforeRaw,
    spotPriceBefore,
    spotPriceAfter,
    tokenOut: new CoinPretty(
      tokenIn.currency,
      new Dec(tokenIn.amount).mul(
        DecUtils.getTenExponentNInPrecisionRange(tokenIn.currency.coinDecimals)
      )
    ),
    priceImpact: new IntPretty(priceImpact)
      .moveDecimalPointRight(2)
      .maxDecimals(4)
      .trim(true),
  };
}

function estimateSwapExactAmountIn_Raw(
  inPoolAsset: { denom: string; amount: Int; weight?: Int },
  outPoolAsset: { denom: string; amount: Int; weight?: Int },
  poolAssets: { amount: Int; denom: string; scalingFactor: number }[],
  tokenIn: Coin,
  swapFee: Dec
): {
  tokenOutAmount: Int;
  spotPriceBefore: Dec;
  spotPriceAfter: Dec;
  priceImpact: Dec;
} {
  if (!inPoolAsset.weight && !outPoolAsset.weight && poolAssets.length === 0)
    throw Error("Supplied neither weighted or stable pool metadata");

  const stableSwapTokens = poolAssets.map((asset) => ({
    ...asset,
    amount: new Dec(asset.amount),
  }));

  const spotPriceBefore =
    inPoolAsset.weight && outPoolAsset.weight
      ? WeightedPoolMath.calcSpotPrice(
          new Dec(inPoolAsset.amount),
          new Dec(inPoolAsset.weight),
          new Dec(outPoolAsset.amount),
          new Dec(outPoolAsset.weight),
          swapFee
        )
      : StableSwapMath.calcSpotPrice(
          stableSwapTokens,
          inPoolAsset.denom,
          outPoolAsset.denom
        );

  const tokenOutAmount =
    inPoolAsset.weight && outPoolAsset.weight
      ? WeightedPoolMath.calcOutGivenIn(
          new Dec(inPoolAsset.amount),
          new Dec(inPoolAsset.weight),
          new Dec(outPoolAsset.amount),
          new Dec(outPoolAsset.weight),
          new Dec(tokenIn.amount),
          swapFee
        ).truncate()
      : StableSwapMath.calcOutGivenIn(
          stableSwapTokens,
          new Coin(tokenIn.denom, tokenIn.amount),
          outPoolAsset.denom,
          swapFee
        );

  const movedStableTokens = stableSwapTokens.map((token) => {
    if (token.denom === inPoolAsset.denom) {
      return {
        ...token,
        amount: token.amount.add(new Dec(inPoolAsset.amount)),
      };
    }
    if (token.denom === outPoolAsset.denom) {
      return {
        ...token,
        amount: token.amount.sub(new Dec(outPoolAsset.amount)),
      };
    }
    return token;
  });
  const spotPriceAfter =
    inPoolAsset.weight && outPoolAsset.weight
      ? WeightedPoolMath.calcSpotPrice(
          new Dec(inPoolAsset.amount).add(new Dec(tokenIn.amount)),
          new Dec(inPoolAsset.weight),
          new Dec(outPoolAsset.amount).sub(new Dec(tokenOutAmount)),
          new Dec(outPoolAsset.weight),
          swapFee
        )
      : StableSwapMath.calcSpotPrice(
          movedStableTokens,
          inPoolAsset.denom,
          outPoolAsset.denom
        );

  if (spotPriceAfter.lt(spotPriceBefore)) {
    throw new Error("spot price can't be decreased after swap");
  }

  const effectivePrice = new Dec(tokenIn.amount).quo(new Dec(tokenOutAmount));
  const priceImpact = effectivePrice.quo(spotPriceBefore).sub(new Dec("1"));

  return {
    tokenOutAmount,
    spotPriceBefore,
    spotPriceAfter,
    priceImpact,
  };
}

function estimateSwapExactAmountOut_Raw(
  inPoolAsset: { denom: string; amount: Int; weight?: Int },
  outPoolAsset: { denom: string; amount: Int; weight?: Int },
  poolAssets: { amount: Int; denom: string; scalingFactor: number }[],
  tokenOut: Coin,
  swapFee: Dec
): {
  tokenInAmount: Int;
  spotPriceBefore: Dec;
  spotPriceAfter: Dec;
  priceImpact: Dec;
} {
  if (!inPoolAsset.weight && !outPoolAsset.weight && poolAssets.length === 0)
    throw Error("Supplied neither weighted or stable pool metadata");

  const stableSwapTokens = poolAssets.map((asset) => ({
    ...asset,
    amount: new Dec(asset.amount),
  }));

  const spotPriceBefore =
    inPoolAsset.weight && outPoolAsset.weight
      ? WeightedPoolMath.calcSpotPrice(
          new Dec(inPoolAsset.amount),
          new Dec(inPoolAsset.weight),
          new Dec(outPoolAsset.amount),
          new Dec(outPoolAsset.weight),
          swapFee
        )
      : StableSwapMath.calcSpotPrice(
          stableSwapTokens,
          inPoolAsset.denom,
          outPoolAsset.denom
        );

  const tokenInAmount =
    inPoolAsset.weight && outPoolAsset.weight
      ? WeightedPoolMath.calcInGivenOut(
          new Dec(inPoolAsset.amount),
          new Dec(inPoolAsset.weight),
          new Dec(outPoolAsset.amount),
          new Dec(outPoolAsset.weight),
          new Dec(tokenOut.amount),
          swapFee
        ).truncate()
      : StableSwapMath.calcInGivenOut(
          stableSwapTokens,
          new Coin(outPoolAsset.denom, outPoolAsset.amount),
          inPoolAsset.denom,
          swapFee
        );

  const movedStableTokens = stableSwapTokens.map((token) => {
    if (token.denom === inPoolAsset.denom) {
      return {
        ...token,
        amount: token.amount.add(new Dec(inPoolAsset.amount)),
      };
    }
    if (token.denom === outPoolAsset.denom) {
      return {
        ...token,
        amount: token.amount.sub(new Dec(outPoolAsset.amount)),
      };
    }
    return token;
  });
  const spotPriceAfter =
    inPoolAsset.weight && outPoolAsset.weight
      ? WeightedPoolMath.calcSpotPrice(
          new Dec(inPoolAsset.amount).add(new Dec(inPoolAsset.amount)),
          new Dec(inPoolAsset.weight),
          new Dec(outPoolAsset.amount).sub(new Dec(outPoolAsset.amount)),
          new Dec(outPoolAsset.weight),
          swapFee
        )
      : StableSwapMath.calcSpotPrice(
          movedStableTokens,
          inPoolAsset.denom,
          outPoolAsset.denom
        );

  if (spotPriceAfter.lt(spotPriceBefore)) {
    throw new Error("spot price can't be decreased after swap");
  }

  const effectivePrice = new Dec(tokenInAmount).quo(new Dec(tokenOut.amount));
  const priceImpact = effectivePrice.quo(spotPriceBefore).sub(new Dec("1"));

  return {
    tokenInAmount,
    spotPriceBefore,
    spotPriceAfter,
    priceImpact,
  };
}

function estimateJoinPool_Raw(
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
    const tokenInAmount = shareRatio.mul(new Dec(poolAsset.amount)).truncate();

    tokenIns.push(new Coin(poolAsset.denom, tokenInAmount));
  }

  return {
    tokenIns,
  };
}

function estimateExitPool_Raw(
  totalShare: Int,
  poolAssets: { denom: string; amount: Int }[],
  shareInAmount: Int,
  exitFee: Dec
): {
  tokenOuts: Coin[];
} {
  const tokenOuts: Coin[] = [];

  if (exitFee.gte(new Dec(0))) {
    // https://github.com/osmosis-labs/osmosis/blob/main/x/gamm/pool-models/internal/cfmm_common/lp.go#L25
    shareInAmount = new Dec(shareInAmount)
      .sub(new Dec(shareInAmount).mulTruncate(exitFee))
      .round();
  }

  const shareRatio = new Dec(shareInAmount).quo(new Dec(totalShare));
  if (shareRatio.lte(new Dec(0))) {
    throw new Error("share ratio is zero or negative");
  }

  for (const poolAsset of poolAssets) {
    const tokenOutAmount = shareRatio.mul(new Dec(poolAsset.amount)).truncate();

    tokenOuts.push(new Coin(poolAsset.denom, tokenOutAmount));
  }

  return {
    tokenOuts,
  };
}

function estimateJoinSwapExternAmountIn_Raw(
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
