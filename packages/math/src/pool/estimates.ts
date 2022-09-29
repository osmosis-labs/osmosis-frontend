import {
  Dec,
  DecUtils,
  Int,
  IntPretty,
  Coin,
  CoinPretty,
} from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import {
  calcSpotPrice,
  calcInGivenOut,
  calcOutGivenIn,
  calcPoolOutGivenSingleIn,
} from "./weighted";

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
      .truncate()
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
  priceImpact: IntPretty;
  raw: ReturnType<typeof estimateSwapExactAmountIn_Raw>;
} {
  const estimated = estimateSwapExactAmountIn_Raw(
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
  priceImpact: IntPretty;
  raw: ReturnType<typeof estimateSwapExactAmountOut_Raw>;
} {
  const estimated = estimateSwapExactAmountOut_Raw(
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
  inPoolAsset: { amount: Int; weight: Int },
  outPoolAsset: { amount: Int; weight: Int },
  tokenIn: Coin,
  swapFee: Dec
): {
  tokenOutAmount: Int;
  spotPriceBefore: Dec;
  spotPriceAfter: Dec;
  priceImpact: Dec;
} {
  const spotPriceBefore = calcSpotPrice(
    new Dec(inPoolAsset.amount),
    new Dec(inPoolAsset.weight),
    new Dec(outPoolAsset.amount),
    new Dec(outPoolAsset.weight),
    swapFee
  );

  const tokenOutAmount = calcOutGivenIn(
    new Dec(inPoolAsset.amount),
    new Dec(inPoolAsset.weight),
    new Dec(outPoolAsset.amount),
    new Dec(outPoolAsset.weight),
    new Dec(tokenIn.amount),
    swapFee
  ).truncate();

  const spotPriceAfter = calcSpotPrice(
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
  const priceImpact = effectivePrice.quo(spotPriceBefore).sub(new Dec("1"));

  return {
    tokenOutAmount,
    spotPriceBefore,
    spotPriceAfter,
    priceImpact,
  };
}

function estimateSwapExactAmountOut_Raw(
  inPoolAsset: { amount: Int; weight: Int },
  outPoolAsset: { amount: Int; weight: Int },
  tokenOut: Coin,
  swapFee: Dec
): {
  tokenInAmount: Int;
  spotPriceBefore: Dec;
  spotPriceAfter: Dec;
  priceImpact: Dec;
} {
  const spotPriceBefore = calcSpotPrice(
    new Dec(inPoolAsset.amount),
    new Dec(inPoolAsset.weight),
    new Dec(outPoolAsset.amount),
    new Dec(outPoolAsset.weight),
    swapFee
  );

  const tokenInAmount = calcInGivenOut(
    new Dec(inPoolAsset.amount),
    new Dec(inPoolAsset.weight),
    new Dec(outPoolAsset.amount),
    new Dec(outPoolAsset.weight),
    new Dec(tokenOut.amount),
    swapFee
  ).truncate();

  const spotPriceAfter = calcSpotPrice(
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
  const shareOutAmount = calcPoolOutGivenSingleIn(
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
