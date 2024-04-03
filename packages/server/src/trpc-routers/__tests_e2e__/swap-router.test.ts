import { CoinPretty, Int, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { isNumeric } from "@osmosis-labs/utils";
import { initTRPC } from "@trpc/server";

import { AssetLists } from "../../queries/__tests__/mock-asset-lists";
import { MockChains } from "../../queries/__tests__/mock-chains";
import { createInnerTRPCContext } from "../../trpc";
import { superjson } from "../../utils/superjson";
import { swapRouter } from "../swap-router";

const { createCallerFactory, router: createTRPCRouter } = initTRPC
  .context<typeof createInnerTRPCContext>()
  .create({
    transformer: superjson,
  });
const createCaller = createCallerFactory(createTRPCRouter({ swapRouter }));
const caller = createCaller({
  assetLists: AssetLists,
  chainList: MockChains,
});

const percentageRegex = /^(<\s)?\d+\.\d+%$/;
const atomMinimalDenom =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
const osmoMinimalDenom = "uosmo";

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
  expect(reply.amount.currency).toMatchInlineSnapshot(`
    {
      "coinDecimals": 6,
      "coinDenom": "OSMO",
      "coinGeckoId": "osmosis",
      "coinImageUrl": "/tokens/generated/osmo.svg",
      "coinMinimalDenom": "uosmo",
      "coinName": "Osmosis",
      "isUnstable": false,
      "isVerified": true,
    }
  `);
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
  expect(reply.amount.currency).toMatchInlineSnapshot(`
    {
      "coinDecimals": 6,
      "coinDenom": "ATOM",
      "coinGeckoId": "cosmos",
      "coinImageUrl": "/tokens/generated/atom.svg",
      "coinMinimalDenom": "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      "coinName": "Cosmos Hub",
      "isUnstable": false,
      "isVerified": true,
    }
  `);
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
