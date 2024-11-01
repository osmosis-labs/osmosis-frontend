import { CoinPretty, Int, RatePretty } from "@keplr-wallet/unit";
import { SplitTokenInQuote, SplitTokenOutQuote } from "@osmosis-labs/pools";
import { AssetList } from "@osmosis-labs/types";
import { z } from "zod";

import { captureIfError } from "../../utils";
import { getSidecarRouter } from "../sidecar/router";
import { getAsset, getCosmwasmPoolTypeFromCodeId, Pool } from ".";

export const getRouteTokenOutGivenInParams = z.object({
  tokenInDenom: z.string(),
  tokenInAmount: z.string(),
  tokenOutDenom: z.string(),
  forcePoolId: z.string().optional(),
});

type GetRouteTokenOutGivenInParams = z.infer<
  typeof getRouteTokenOutGivenInParams
>;

export async function getRouteTokenOutGivenIn({
  tokenInDenom,
  tokenInAmount,
  tokenOutDenom,
  forcePoolId,
  assetLists,
}: GetRouteTokenOutGivenInParams & { assetLists: AssetList[] }) {
  const router = getSidecarRouter();

  // send to router
  const startTime = Date.now();
  const quote = await router.routeByTokenIn(
    {
      denom: tokenInDenom,
      amount: new Int(tokenInAmount),
    },
    tokenOutDenom,
    forcePoolId
  );
  const timeMs = Date.now() - startTime;

  const tokenOutAsset = getAsset({
    assetLists,
    anyDenom: tokenOutDenom,
  });
  const tokenInAsset = getAsset({
    assetLists,
    anyDenom: tokenInDenom,
  });

  const fee = quote.swapFee
    ? quote.amount.toDec().mul(quote.swapFee).truncate()
    : undefined;

  console.log({ fee: fee?.toString() });

  return {
    ...quote,
    split: makeDisplayableOutGivenInSplit(quote.split, assetLists),
    timeMs,
    amount: new CoinPretty(tokenOutAsset, quote.amount),
    priceImpactTokenOut: quote.priceImpactTokenOut
      ? new RatePretty(quote.priceImpactTokenOut.abs())
      : undefined,
    swapFee: quote.swapFee ? new RatePretty(quote.swapFee) : undefined,
    feeAmount: fee ? new CoinPretty(tokenInAsset, fee) : undefined,
  };
}

/** Get pool type, in, and out currency for displaying the route in detail. */
function makeDisplayableOutGivenInSplit(
  split: SplitTokenInQuote["split"],
  assetLists: AssetList[]
) {
  return split.map((existingSplit) => {
    const { pools, tokenInDenom, tokenOutDenoms } = existingSplit;
    const poolsWithInfos = pools.map((pool_, index) => {
      let type: Pool["type"] = pool_.type as Pool["type"];

      if (pool_?.codeId) {
        type = getCosmwasmPoolTypeFromCodeId(pool_.codeId);
      }

      const inAsset = captureIfError(() =>
        getAsset({
          assetLists,
          anyDenom: index === 0 ? tokenInDenom : tokenOutDenoms[index - 1],
        })
      );
      const outAsset = captureIfError(() =>
        getAsset({
          assetLists,
          anyDenom: tokenOutDenoms[index],
        })
      );

      return {
        id: pool_.id,
        type,
        spreadFactor: new RatePretty(pool_.swapFee ? pool_.swapFee : 0),
        dynamicSpreadFactor: type === "cosmwasm-astroport-pcl",
        inCurrency: inAsset,
        outCurrency: outAsset,
      };
    });

    return {
      ...existingSplit,
      pools: poolsWithInfos,
    };
  });
}

export const getRouteTokenInGivenOutParams = z.object({
  tokenInDenom: z.string(),
  tokenOutAmount: z.string(),
  tokenOutDenom: z.string(),
  forcePoolId: z.string().optional(),
});

type GetRouteTokenInGivenOutParams = z.infer<
  typeof getRouteTokenInGivenOutParams
>;

export async function getRouteTokenInGivenOut({
  tokenInDenom,
  tokenOutAmount,
  tokenOutDenom,
  forcePoolId,
  assetLists,
}: GetRouteTokenInGivenOutParams & { assetLists: AssetList[] }) {
  const router = getSidecarRouter();

  // send to router
  const startTime = Date.now();

  const quote = await router.routeByTokenOut(
    {
      denom: tokenOutDenom,
      amount: new Int(tokenOutAmount),
    },
    tokenInDenom,
    forcePoolId
  );

  const timeMs = Date.now() - startTime;

  const tokenInAsset = getAsset({
    assetLists,
    anyDenom: tokenInDenom,
  });

  const fee = quote.swapFee
    ? quote.amount.toDec().mul(quote.swapFee).truncate()
    : undefined;

  return {
    ...quote,
    split: makeDisplayableInGivenOutSplit(quote.split, assetLists),
    // supplementary data with display types
    name,
    timeMs,
    amount: new CoinPretty(tokenInAsset, quote.amount),
    priceImpactTokenOut: quote.priceImpactTokenOut
      ? new RatePretty(quote.priceImpactTokenOut.abs())
      : undefined,
    swapFee: quote.swapFee ? new RatePretty(quote.swapFee) : undefined,
    feeAmount: fee ? new CoinPretty(tokenInAsset, fee) : undefined,
  };
}

/** Get pool type, in, and out currency for displaying the route in detail. */
function makeDisplayableInGivenOutSplit(
  split: SplitTokenOutQuote["split"],
  assetLists: AssetList[]
) {
  return split.map((existingSplit) => {
    const { pools, tokenInDenoms, tokenOutDenom } = existingSplit;
    const poolsWithInfos = pools.map((pool_, index) => {
      let type: Pool["type"] = pool_.type as Pool["type"];

      if (pool_?.codeId) {
        type = getCosmwasmPoolTypeFromCodeId(pool_.codeId);
      }

      const inAsset = captureIfError(() =>
        getAsset({
          assetLists,
          anyDenom: tokenInDenoms[index],
        })
      );
      const outAsset = captureIfError(() =>
        getAsset({
          assetLists,
          anyDenom:
            index === pools.length - 1
              ? tokenOutDenom
              : tokenInDenoms[index + 1],
        })
      );

      return {
        id: pool_.id,
        type,
        spreadFactor: new RatePretty(pool_.swapFee ? pool_.swapFee : 0),
        dynamicSpreadFactor: type === "cosmwasm-astroport-pcl",
        inCurrency: inAsset,
        outCurrency: outAsset,
      };
    });

    return {
      ...existingSplit,
      pools: poolsWithInfos,
    };
  });
}
