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
import {
  getAssetFromAssetList,
  isNumeric,
  makeMinimalAsset,
} from "@osmosis-labs/utils";
import { inferRouterOutputs, initTRPC } from "@trpc/server";

import {
  getCachedPoolMarketMetricsMap,
  getPoolsFromIndexer,
} from "../../queries";
import { AssetLists } from "../../queries/__tests__/mock-asset-lists";
import { MockChains } from "../../queries/__tests__/mock-chains";
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

const percentageRegex = /^(<\s)?\d+\.\d+%$/;
const atomMinimalDenom = atomAsset.coinMinimalDenom;
const osmoMinimalDenom = osmoAsset.coinMinimalDenom;
const usdcMinimalDenom = usdcAsset.coinMinimalDenom;
const usdtMinimalDenom = usdtAsset.coinMinimalDenom;
const uskMinimalDenom = uskAsset.coinMinimalDenom;
const usdcAxelarMinimalDenom = usdcAxelarAsset.coinMinimalDenom;
const astroMinimalDenom = astroAsset.coinMinimalDenom;

it("Sidecar - ATOM <> OSMO - should return valid quote", async () => {
  const tokenInAmount = "1000000";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: atomMinimalDenom,
    tokenInAmount,
    tokenOutDenom: osmoMinimalDenom,
    preferredRouter: "sidecar",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(osmoAsset.rawAsset));

  const amount = reply.amount.toDec().toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Swap fee
  expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = reply.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  expect(parseFloat(priceImpactTokenOut)).toBeGreaterThan(0);

  // Token in fee amount
  expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(atomMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // name
  expect(reply.name).toBe("sidecar");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = reply
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

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

it("Sidecar - OSMO <> ATOM - should return valid quote", async () => {
  const tokenInAmount = "1000000";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: osmoMinimalDenom,
    tokenInAmount,
    tokenOutDenom: atomMinimalDenom,
    preferredRouter: "sidecar",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(atomAsset.rawAsset));

  const amount = reply.amount.toDec().toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Swap fee
  expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = reply.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  expect(parseFloat(priceImpactTokenOut)).toBeGreaterThan(0);

  // Token in fee amount
  expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(osmoMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // name
  expect(reply.name).toBe("sidecar");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = reply
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

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

it("Sidecar - USDC <> USDT - should return valid quote. Token in amount difference should be less than 5% to token out amount", async () => {
  const tokenInAmount = "1000000";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: usdcMinimalDenom,
    tokenInAmount,
    tokenOutDenom: usdtMinimalDenom,
    preferredRouter: "sidecar",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(usdtAsset.rawAsset));

  const tokenInAmountDec = new Dec(tokenInAmount).quo(
    DecUtils.getTenExponentN(usdcAsset.decimals)
  );

  const amountDec = reply.amount.toDec();
  const amount = amountDec.toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Token out amount should be less than 5% of token in amount
  expect(
    tokenInAmountDec.sub(amountDec).quo(tokenInAmountDec).lte(new Dec("0.05"))
  ).toBeTruthy();

  // Swap fee
  expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = reply.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  expect(parseFloat(priceImpactTokenOut)).toBeGreaterThan(0);

  // Token in fee amount
  expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(usdcMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // name
  expect(reply.name).toBe("sidecar");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = reply
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

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

it("Sidecar - USDT <> USDC - should return valid quote. Token in amount difference should be less than 5% to token out amount", async () => {
  const tokenInAmount = "1000000";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: usdtMinimalDenom,
    tokenInAmount,
    tokenOutDenom: usdcMinimalDenom,
    preferredRouter: "sidecar",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(usdcAsset.rawAsset));

  const tokenInAmountDec = new Dec(tokenInAmount).quo(
    DecUtils.getTenExponentN(usdcAsset.decimals)
  );

  const amountDec = reply.amount.toDec();
  const amount = amountDec.toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Token out amount should be less than 5% of token in amount
  expect(
    tokenInAmountDec.sub(amountDec).quo(tokenInAmountDec).lte(new Dec("0.05"))
  ).toBeTruthy();

  // Swap fee
  expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = reply.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  expect(parseFloat(priceImpactTokenOut)).toBeGreaterThan(0);

  // Token in fee amount
  expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(usdtMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // name
  expect(reply.name).toBe("sidecar");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = reply
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

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

it("Sidecar - OSMO <> USK - should return valid quote even if the token price is not supported", async () => {
  const tokenInAmount = "1000000";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: osmoMinimalDenom,
    tokenInAmount,
    tokenOutDenom: uskMinimalDenom,
    preferredRouter: "sidecar",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(uskAsset.rawAsset));

  const amount = reply.amount.toDec().toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Swap fee
  expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = reply.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  expect(parseFloat(priceImpactTokenOut)).toBeGreaterThan(0);

  // Token in fee amount
  expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(osmoMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // name
  expect(reply.name).toBe("sidecar");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = reply
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

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

it("Sidecar — USDC.axl <> USDC — Should return valid quote for alloyed assets", async () => {
  const tokenInAmount = "1000000";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: usdcAxelarMinimalDenom,
    tokenInAmount,
    tokenOutDenom: usdcMinimalDenom,
    preferredRouter: "sidecar",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(usdcAsset.rawAsset));

  const tokenInAmountDec = new Dec(tokenInAmount).quo(
    DecUtils.getTenExponentN(usdcAsset.decimals)
  );

  const amountDec = reply.amount.toDec();
  const amount = amountDec.toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Token out amount should be the same as in amount
  expect(tokenInAmountDec.equals(amountDec)).toBeTruthy();

  // Swap fee
  expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = reply.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Price impact should be 0%
  expect(reply.priceImpactTokenOut?.toString()).toEqual("0%");

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();

  // Token in fee amount
  expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  let transmuterPool:
    | RouterOutputs["swapRouter"]["routeTokenOutGivenIn"]["split"][number]["pools"][number]
    | undefined;
  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(usdcAxelarMinimalDenom);

    transmuterPool = split.pools.find(
      (pool) => pool.type === "cosmwasm-transmuter"
    );

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // Alloyed assets should go through a transmuter pool
  expect(transmuterPool).toBeDefined();
  expect(transmuterPool!.inCurrency).toEqual(
    makeMinimalAsset(usdcAxelarAsset.rawAsset)
  );
  expect(transmuterPool!.outCurrency).toEqual(
    makeMinimalAsset(usdcAsset.rawAsset)
  );

  // name
  expect(reply.name).toBe("sidecar");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = reply
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

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

it("Sidecar — ASTRO <> OSMO — Should return valid quote for PCL pool", async () => {
  const tokenInAmount = "1000000";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: astroMinimalDenom,
    tokenInAmount,
    tokenOutDenom: osmoMinimalDenom,
    preferredRouter: "sidecar",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(osmoAsset.rawAsset));

  const amountDec = reply.amount.toDec();
  const amount = amountDec.toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Swap fee
  expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = reply.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  // Should match with the format of "0.1%"
  expect(reply.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  // Token in fee amount
  expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  let pclPool:
    | RouterOutputs["swapRouter"]["routeTokenOutGivenIn"]["split"][number]["pools"][number]
    | undefined;
  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(astroMinimalDenom);

    pclPool = split.pools.find(
      (pool) => pool.type === "cosmwasm-astroport-pcl"
    );

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // PCL assets should go through a pcl pool
  expect(pclPool).toBeDefined();
  expect(pclPool!.inCurrency).toEqual(makeMinimalAsset(astroAsset.rawAsset));
  expect(pclPool!.outCurrency).toEqual(makeMinimalAsset(osmoAsset.rawAsset));

  // name
  expect(reply.name).toBe("sidecar");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = reply
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

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

it("TFM - ATOM <> OSMO - should return valid partial quote (no swap fee)", async () => {
  const tokenInAmount = "1000000";
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: atomMinimalDenom,
    tokenInAmount,
    tokenOutDenom: osmoMinimalDenom,
    preferredRouter: "tfm",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(osmoAsset.rawAsset));

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
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(atomMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

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

  const [inAsset, toAsset] = mediumVolumePool.reserveCoins;

  const tokenInAmount = new Dec(1)
    .mul(DecUtils.getTenExponentN(inAsset.currency.coinDecimals))
    .truncate()
    .toString();
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: inAsset.currency.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: toAsset.currency.coinMinimalDenom,
    preferredRouter: "sidecar",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(osmoAsset.rawAsset));

  const amount = reply.amount.toDec().toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Swap fee
  expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = reply.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  expect(parseFloat(priceImpactTokenOut)).toBeGreaterThan(0);

  // Token in fee amount
  expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(inAsset.currency.coinMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // name
  expect(reply.name).toBe("sidecar");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = reply
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

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

it("Sidecar — Should return valid quote for low volume token", async () => {
  const { averageVolume, sortedPoolsWithVolume } =
    await getSortedPoolsWithVolume();

  const lowVolumeToken = sortedPoolsWithVolume.find(
    (pool) =>
      // Find a token that is 75% less than the average volume
      pool.volume24hUsdDec.lte(averageVolume.mul(new Dec(0.75))) &&
      pool.reserveCoins.length === 2
  )!;

  const [inAsset, toAsset] = lowVolumeToken.reserveCoins;

  const tokenInAmount = new Dec(1)
    .mul(DecUtils.getTenExponentN(inAsset.currency.coinDecimals))
    .truncate()
    .toString();
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom: inAsset.currency.coinMinimalDenom,
    tokenInAmount,
    tokenOutDenom: toAsset.currency.coinMinimalDenom,
    preferredRouter: "sidecar",
  });

  // Amount
  expect(reply.amount).toBeInstanceOf(CoinPretty);
  expect(reply.amount.currency).toEqual(makeMinimalAsset(osmoAsset.rawAsset));

  const amount = reply.amount.toDec().toString();
  expect(isNumeric(amount)).toBeTruthy();
  // Make sure amount is not negative
  expect(parseFloat(amount)).toBeGreaterThan(0);

  // Swap fee
  expect(reply.swapFee).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.swapFee?.toString()).toMatch(percentageRegex);

  const swapFee = reply.swapFee!.toDec().toString();
  expect(isNumeric(swapFee)).toBeTruthy();
  expect(parseFloat(swapFee)).toBeGreaterThan(0);

  // Price impact token out
  expect(reply.priceImpactTokenOut).toBeInstanceOf(RatePretty);
  // Should match with the format of "0.1%"
  expect(reply.priceImpactTokenOut?.toString()).toMatch(percentageRegex);

  const priceImpactTokenOut = reply.priceImpactTokenOut!.toDec().toString();
  expect(isNumeric(priceImpactTokenOut)).toBeTruthy();
  expect(parseFloat(priceImpactTokenOut)).toBeGreaterThan(0);

  // Token in fee amount
  expect(reply.tokenInFeeAmount).toBeInstanceOf(Int);
  const tokenInFeeAmount = reply.tokenInFeeAmount!.toString();
  expect(isNumeric(tokenInFeeAmount)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmount)).toBeGreaterThan(0);

  // Split
  expect(Array.isArray(reply.split)).toBeTruthy();
  expect(reply.split.length).toBeGreaterThan(0);

  for (const split of reply.split) {
    expect(split.initialAmount).toBeInstanceOf(Int);
    expect(split.initialAmount.toString()).toBe(tokenInAmount);

    expect(Array.isArray(split.pools)).toBeTruthy();
    expect(split.pools.length).toBeGreaterThan(0);

    expect(split.tokenInDenom).toBe(inAsset.currency.coinMinimalDenom);

    expect(Array.isArray(split.tokenOutDenoms)).toBeTruthy();
    expect(split.tokenOutDenoms.length).toBeGreaterThan(0);
  }

  // name
  expect(reply.name).toBe("sidecar");

  // timeMs
  expect(isNumeric(reply.timeMs)).toBeTruthy();

  // Token in fee amount fiat value
  expect(reply.tokenInFeeAmountFiatValue).toBeInstanceOf(PricePretty);

  const tokenInFeeAmountFiatValue = reply
    .tokenInFeeAmountFiatValue!.toDec()
    .toString();
  expect(isNumeric(tokenInFeeAmountFiatValue)).toBeTruthy();
  expect(parseFloat(tokenInFeeAmountFiatValue)).toBeGreaterThan(0);

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
