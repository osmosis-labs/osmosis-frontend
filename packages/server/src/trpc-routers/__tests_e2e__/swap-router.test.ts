/**
 * End-to-End (E2E) tests for the swap-router TRPC router.
 * These tests perform smoke testing on the router using
 * production data from the SQS Osmosis API to ensure
 * functionality and stability.
 */
import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/types";
import {
  getAssetFromAssetList,
  isNumeric,
  makeMinimalAsset,
} from "@osmosis-labs/utils";
import { inferRouterInputs, inferRouterOutputs, initTRPC } from "@trpc/server";

import {
  getCachedPoolMarketMetricsMap,
  getPoolsFromIndexer,
} from "../../queries";
import { AssetLists } from "../../queries/__tests__/mock-asset-lists";
import { MockChains } from "../../queries/__tests__/mock-chains";
import { getPriceFromSidecar } from "../../queries/complex/assets/price/providers/sidecar";
import { createInnerTRPCContext } from "../../trpc";
import { sort } from "../../utils";
import { superjson } from "../../utils/superjson";
import { swapRouter } from "../swap-router";

const { createCallerFactory, router: createTRPCRouter } = initTRPC
  .context<typeof createInnerTRPCContext>()
  .create({
    transformer: superjson,
  });
const router = createTRPCRouter({ swapRouter });
const createCaller = createCallerFactory(router);
const caller = createCaller({
  /**
   * The asset list and chain list used here are snapshots of the
   * production asset list. In case of discrepancies due to outdated
   * assets or chains, consider updating these mocks.
   */
  assetLists: AssetLists,
  chainList: MockChains,
});

type RouterOutputs = inferRouterOutputs<typeof router>;
type RouterInputs = inferRouterInputs<typeof router>;

const atomAsset = getAssetFromAssetList({
  assetLists: AssetLists,
  sourceDenom: "uatom",
})!;
const osmoAsset = getAssetFromAssetList({
  assetLists: AssetLists,
  coinMinimalDenom: "uosmo",
})!;
const usdcAsset = getAssetFromAssetList({
  symbol: "USDC",
  assetLists: AssetLists,
})!;
const usdtAsset = getAssetFromAssetList({
  symbol: "USDT",
  assetLists: AssetLists,
})!;
const usdcAxelarAsset = getAssetFromAssetList({
  symbol: "USDC.axl",
  assetLists: AssetLists,
})!;

// Assets SQS does not support prices — USK
const uskAsset = getAssetFromAssetList({
  symbol: "USK",
  assetLists: AssetLists,
})!;

// PCL Assets
const astroAsset = getAssetFromAssetList({
  symbol: "ASTRO",
  assetLists: AssetLists,
})!;

const percentageRegex = /^(<\s)?\d*\.?\d+%$/;

function assertValidQuote({
  quote,
  tokenIn,
  tokenOut,
  tokenInAmount,
  router,
}: {
  quote: RouterOutputs["swapRouter"]["routeTokenOutGivenIn"];
  tokenInAmount: string;
  tokenIn: Asset;
  tokenOut: Asset;
  router: RouterInputs["swapRouter"]["routeTokenOutGivenIn"]["preferredRouter"];
}) {
  // Amount
  expect(quote.amount).toBeInstanceOf(CoinPretty);
  expect(quote.amount.currency).toEqual(makeMinimalAsset(tokenOut));

  const amount = quote.amount.toDec().toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Swap fee
  expect(quote.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(quote.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = quote.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(quote.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(quote.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  const priceImpactTokenOut = quote.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  expect(parseFloat(priceImpactTokenOut)).toBeGreaterThanOrEqual(0);

  // Token in fee amount
  expect(quote.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = quote.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(quote.split)).toBeTruthy();
  expect(quote.split.length).toBeGreaterThan(0);

  for (const split of quote.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(tokenIn.coinMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // Sum of all split amount should equal token in amount
  const splitAmountSum = quote.split.reduce(
    (acc, split) => acc.add(split.initialAmount),
    new Int(0)
  );
  expect(splitAmountSum.equals(new Int(tokenInAmount))).toBeTruthy();

  // name
  expect(quote.name).toBe(router);

  // timeMs
  expect(isNumeric(quote.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(quote.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = quote
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

  // token out price
  expect(quote.tokenOutPrice).toBeInstanceOf(PricePretty);

  const tokenOutPrice = quote.tokenOutPrice!.toDec().toString();
  expect(isNumeric(tokenOutPrice)).toBeTruthy();
  expect(parseFloat(tokenOutPrice)).toBeGreaterThan(0);

  // amount fiat value
  expect(quote.amountFiatValue).toBeInstanceOf(PricePretty);

  const amountFiatValue = quote.amountFiatValue!.toDec().toString();
  expect(isNumeric(amountFiatValue)).toBeTruthy();
  expect(parseFloat(amountFiatValue)).toBeGreaterThan(0);
}

jest.retryTimes(2, { logErrorsBeforeRetry: true });

it("Sidecar - ATOM <> OSMO - should return valid quote", async () => {
  const tokenInAmount = "1000000";
  const tokenIn = atomAsset;
  const tokenOut = osmoAsset;
  const preferredRouter = "sidecar";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.coinMinimalDenom,
    preferredRouter,
  });

  assertValidQuote({
    quote: reply,
    tokenInAmount,
    tokenIn: tokenIn.rawAsset,
    tokenOut: tokenOut.rawAsset,
    router: preferredRouter,
  });
});

it("Sidecar - OSMO <> ATOM - should return valid quote", async () => {
  const tokenInAmount = "1000000";
  const tokenIn = osmoAsset;
  const tokenOut = atomAsset;
  const preferredRouter = "sidecar";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.coinMinimalDenom,
    preferredRouter,
  });

  assertValidQuote({
    quote: reply,
    tokenInAmount,
    tokenIn: tokenIn.rawAsset,
    tokenOut: tokenOut.rawAsset,
    router: preferredRouter,
  });
});

it("Sidecar - USDC <> USDT - should return valid quote. Token in amount difference should be less than 5% to token out amount", async () => {
  const tokenInAmount = "1000000";
  const tokenIn = usdcAsset;
  const tokenOut = usdtAsset;
  const preferredRouter = "sidecar";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.coinMinimalDenom,
    preferredRouter,
  });

  assertValidQuote({
    quote: reply,
    tokenInAmount,
    tokenIn: tokenIn.rawAsset,
    tokenOut: tokenOut.rawAsset,
    router: preferredRouter,
  });

  const tokenInAmountDec = new Dec(tokenInAmount).quo(
    DecUtils.getTenExponentN(tokenIn.decimals)
  );

  const amountDec = reply.amount.toDec();

  // Token out amount should be less than 5% of token in amount
  expect(
    tokenInAmountDec.sub(amountDec).quo(tokenInAmountDec).lte(new Dec("0.05"))
  ).toBeTruthy();
});

it("Sidecar - USDT <> USDC - should return valid quote. Token in amount difference should be less than 5% to token out amount", async () => {
  const tokenInAmount = "1000000";
  const tokenIn = usdtAsset;
  const tokenOut = usdcAsset;
  const preferredRouter = "sidecar";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.coinMinimalDenom,
    preferredRouter,
  });

  assertValidQuote({
    quote: reply,
    tokenInAmount,
    tokenIn: tokenIn.rawAsset,
    tokenOut: tokenOut.rawAsset,
    router: preferredRouter,
  });

  const tokenInAmountDec = new Dec(tokenInAmount).quo(
    DecUtils.getTenExponentN(tokenIn.decimals)
  );

  const amountDec = reply.amount.toDec();

  // Token out amount should be less than 5% of token in amount
  expect(
    tokenInAmountDec.sub(amountDec).quo(tokenInAmountDec).lte(new Dec("0.05"))
  ).toBeTruthy();
});

it("Sidecar - OSMO <> USK - should return valid quote even if the token price is not supported", async () => {
  const tokenInAmount = "1000000";
  const tokenIn = osmoAsset;
  const tokenOut = uskAsset;
  const preferredRouter = "sidecar";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.coinMinimalDenom,
    preferredRouter,
  });

  assertValidQuote({
    quote: reply,
    tokenInAmount,
    tokenIn: tokenIn.rawAsset,
    tokenOut: tokenOut.rawAsset,
    router: preferredRouter,
  });
});

it("Sidecar — USDC.axl <> USDC — Should return valid quote for possible alloyed assets", async () => {
  const tokenInAmount = "1000000";
  const tokenIn = usdcAxelarAsset;
  const tokenOut = usdcAsset;
  const preferredRouter = "sidecar";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.coinMinimalDenom,
    preferredRouter,
  });

  assertValidQuote({
    quote: reply,
    tokenInAmount,
    tokenIn: tokenIn.rawAsset,
    tokenOut: tokenOut.rawAsset,
    router: preferredRouter,
  });

  const amountDec = reply.amount.toDec();
  const tokenInAmountDec = new Dec(tokenInAmount).quo(
    DecUtils.getTenExponentN(tokenIn.decimals)
  );

  // Token out amount should be the greater or equal to in amount
  expect(amountDec.gte(tokenInAmountDec)).toBeTruthy();

  // Price impact should be less than 0.5%
  expect(reply.priceImpactTokenOut?.toDec().lte(new Dec(0.05))).toBeTruthy();
});

it("Sidecar — ASTRO <> OSMO — Should return valid quote for PCL pool", async () => {
  const tokenInAmount = "1000000";
  const tokenIn = astroAsset;
  const tokenOut = osmoAsset;
  const preferredRouter = "sidecar";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.coinMinimalDenom,
    preferredRouter,
  });

  assertValidQuote({
    quote: reply,
    tokenInAmount,
    tokenIn: tokenIn.rawAsset,
    tokenOut: tokenOut.rawAsset,
    router: preferredRouter,
  });

  let pclPool:
    | RouterOutputs["swapRouter"]["routeTokenOutGivenIn"]["split"][number]["pools"][number]
    | undefined;
  for (const split of reply.split) {
    pclPool = split.pools.find(
      (pool) => pool.type === "cosmwasm-astroport-pcl"
    );
  }

  // PCL assets should go through a pcl pool
  expect(pclPool).toBeDefined();
  expect(pclPool!.inCurrency).toEqual(makeMinimalAsset(astroAsset.rawAsset));
  expect(pclPool!.outCurrency).toEqual(makeMinimalAsset(osmoAsset.rawAsset));
});

it("TFM - ATOM <> OSMO - should return valid partial quote (no swap fee)", async () => {
  const tokenInAmount = "1000000";
  const tokenIn = atomAsset;
  const tokenOut = osmoAsset;
  const preferredRouter = "tfm";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.coinMinimalDenom,
    preferredRouter,
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(tokenOut.rawAsset));

  const amount = reply.amount.toDec().toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Swap fee
  // expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // // Should match with the format of "0.1%"
  // expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  // const swapFee = reply.swapFee!.toDec().toString();
  // expect(isNumeric(swapFee)).toBeTruthy();
  // expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  expect(parseFloat(priceImpactTokenOut)).toBeGreaterThan(0);

  // Token in fee amount
  // expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  // const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  // expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  // expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(tokenIn.coinMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // Sum of all split amount should equal token in amount
  const splitAmountSum = reply.split.reduce(
    (acc, split) => acc.add(split.initialAmount),
    new Int(0)
  );
  expect(splitAmountSum.equals(new Int(tokenInAmount))).toBeTruthy();

  // name
  expect(reply.name).toBe("tfm");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  // expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  // const tokenInFeeAmountFiatValue = reply
  //   .tokenInFeeAmountFiatValue!.toDec()
  //   .toString();
  // expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  // expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

  // token out price
  expect(reply.tokenOutPrice).toBeInstanceOf(PricePretty);

  const tokenOutPrice = reply.tokenOutPrice!.toDec().toString();
  expect(isNumeric(tokenOutPrice)).toBeTruthy();
  expect(parseFloat(tokenOutPrice)).toBeGreaterThan(0);

  // amount fiat value
  expect(reply.amountFiatValue).toBeInstanceOf(PricePretty);

  const amountFiatValue = reply.amountFiatValue!.toDec().toString();
  expect(isNumeric(amountFiatValue)).toBeTruthy();
  expect(parseFloat(amountFiatValue)).toBeGreaterThan(0);
});

/**
 * Retrieves and sorts liquidity pools by their 24-hour USD volume from the indexer,
 * calculates the total volume and the average volume across all pools.
 * This method is utilized to identify pools with low and medium volume tokens
 * by comparing individual pool volumes against the average.
 *
 * The average volume is calculated as the total volume divided by the number of pools.
 *
 * Criteria:
 * - Medium volume tokens have a 24-hour USD volume less than or equal to the average volume.
 * - Low volume tokens have a 24-hour USD volume less than or equal to 40% of average volume
 */
async function getSortedPoolsWithVolume() {
  const [pools, marketMetrics] = await Promise.all([
    getPoolsFromIndexer({
      assetLists: AssetLists,
      chainList: MockChains,
    }),
    getCachedPoolMarketMetricsMap(),
  ]);

  let totalVolume = new Dec(0);
  const poolsWithVolume = pools
    .map((pool) => {
      const metricsForPool = marketMetrics.get(pool.id);
      if (!metricsForPool) return undefined;

      const volume24hUsdDec =
        metricsForPool.volume24hUsd?.toDec() ?? new Dec(0);
      totalVolume = totalVolume.add(volume24hUsdDec);

      return {
        ...pool,
        volume24hUsdDec,
      };
    })
    .filter((pool): pool is NonNullable<typeof pool> => !!pool);

  const sortedPoolsWithVolume = sort(poolsWithVolume, "volume24hUsdDec");

  const averageVolume = totalVolume.quo(new Dec(sortedPoolsWithVolume.length));

  return { sortedPoolsWithVolume, averageVolume };
}

it("Sidecar — Should return valid quote for medium volume token", async () => {
  const { averageVolume, sortedPoolsWithVolume } =
    await getSortedPoolsWithVolume();

  const mediumVolumePool = sortedPoolsWithVolume.find(
    (pool) =>
      pool.volume24hUsdDec.lte(averageVolume) && pool.reserveCoins.length === 2
  )!;

  const [tokenIn, tokenOut] = mediumVolumePool.reserveCoins;

  const tokenInAsset = getAssetFromAssetList({
    coinMinimalDenom: tokenIn.currency.coinMinimalDenom,
    assetLists: AssetLists,
  })!.rawAsset;

  const tokenPrice = await getPriceFromSidecar(
    AssetLists,
    MockChains,
    tokenInAsset
  );

  // Desired price is 10% of the total fiat value locked in the pool
  const desiredPrice = mediumVolumePool.totalFiatValueLocked
    .toDec()
    .mul(new Dec(0.1));

  // Token in amount is the desired price divided by the token price
  const tokenInAmount = desiredPrice
    .quo(tokenPrice)
    .mul(DecUtils.getTenExponentN(tokenIn.currency.coinDecimals))
    .truncate()
    .toString();

  const preferredRouter = "sidecar";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.currency.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.currency.coinMinimalDenom,
    preferredRouter,
    forcePoolId: mediumVolumePool.id,
  });

  assertValidQuote({
    quote: reply,
    tokenInAmount,
    tokenIn: getAssetFromAssetList({
      coinMinimalDenom: tokenIn.currency.coinMinimalDenom,
      assetLists: AssetLists,
    })!.rawAsset,
    tokenOut: getAssetFromAssetList({
      coinMinimalDenom: tokenOut.currency.coinMinimalDenom,
      assetLists: AssetLists,
    })!.rawAsset,
    router: preferredRouter,
  });
});

it("Sidecar — Should return valid quote for low volume token", async () => {
  const { averageVolume, sortedPoolsWithVolume } =
    await getSortedPoolsWithVolume();

  const lowVolumeTokenPool = sortedPoolsWithVolume.find(
    (pool) =>
      // Find a token that less than or equal to 40% of the average volume
      pool.volume24hUsdDec.lte(averageVolume.mul(new Dec(0.4))) &&
      pool.reserveCoins.length === 2
  )!;

  const [tokenIn, tokenOut] = lowVolumeTokenPool.reserveCoins;

  const tokenInAsset = getAssetFromAssetList({
    coinMinimalDenom: tokenIn.currency.coinMinimalDenom,
    assetLists: AssetLists,
  })!.rawAsset;

  const tokenPrice = await getPriceFromSidecar(
    AssetLists,
    MockChains,
    tokenInAsset
  );

  // Desired price is 10% of the total fiat value locked in the pool
  const desiredPrice = lowVolumeTokenPool.totalFiatValueLocked
    .toDec()
    .mul(new Dec(0.1));

  // Token in amount is the desired price divided by the token price
  const tokenInAmount = desiredPrice
    .quo(tokenPrice)
    .mul(DecUtils.getTenExponentN(tokenIn.currency.coinDecimals))
    .truncate()
    .toString();

  const preferredRouter = "sidecar";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: tokenIn.currency.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: tokenOut.currency.coinMinimalDenom,
    preferredRouter,
    forcePoolId: lowVolumeTokenPool.id,
  });

  assertValidQuote({
    quote: reply,
    tokenInAmount,
    tokenIn: tokenInAsset,
    tokenOut: getAssetFromAssetList({
      coinMinimalDenom: tokenOut.currency.coinMinimalDenom,
      assetLists: AssetLists,
    })!.rawAsset,
    router: preferredRouter,
  });
});
