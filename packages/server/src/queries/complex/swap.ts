import { CoinPretty, Int, RatePretty } from "@keplr-wallet/unit";
import { SplitTokenInQuote } from "@osmosis-labs/pools";
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

  return {
    ...quote,
    split: makeDisplayableSplit(quote.split, assetLists),
    timeMs,
    amount: new CoinPretty(tokenOutAsset, quote.amount),
    priceImpactTokenOut: quote.priceImpactTokenOut
      ? new RatePretty(quote.priceImpactTokenOut.abs())
      : undefined,
    swapFee: quote.swapFee ? new RatePretty(quote.swapFee) : undefined,
  };
}

/** Get pool type, in, and out currency for displaying the route in detail. */
function makeDisplayableSplit(
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
