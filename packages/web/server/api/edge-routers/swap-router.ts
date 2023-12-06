import { CoinPretty, Int, PricePretty, RatePretty } from "@keplr-wallet/unit";
import type { TokenOutGivenInRouter } from "@osmosis-labs/pools";
import { makeStaticPoolFromRaw } from "@osmosis-labs/pools/build/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { z } from "zod";

import { IS_TESTNET } from "~/config/env";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { OsmosisSidecarRemoteRouter } from "~/integrations/sidecar/router";
import { TfmRemoteRouter } from "~/integrations/tfm/router";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { calcAssetValue, getAsset } from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { queryPaginatedPools } from "~/server/queries/complex/pools";
import { routeTokenOutGivenIn } from "~/server/queries/complex/route-token-out-given-in";
import { BestRouteTokenInRouter } from "~/utils/routing/best-route-router";

const osmosisChainId = ChainList[0].chain_id;

const tfmBaseUrl = process.env.NEXT_PUBLIC_TFM_API_BASE_URL;

if (!tfmBaseUrl) throw new Error("TFM base url not set in env");

const sidecarBaseUrl = process.env.NEXT_PUBLIC_SIDECAR_BASE_URL;

if (!sidecarBaseUrl) throw new Error("Sidecar base url not set in env");

const zodAvailableRouterKeys = z.array(z.enum(["tfm", "sidecar", "web"]));

export type AvailableRouterKeys = z.infer<typeof zodAvailableRouterKeys>;

const routers: {
  name: AvailableRouterKeys[number];
  router: TokenOutGivenInRouter;
}[] = [
  {
    name: "tfm",
    router: new TfmRemoteRouter(osmosisChainId, tfmBaseUrl),
  },
  {
    name: "sidecar",
    router: new OsmosisSidecarRemoteRouter(sidecarBaseUrl),
  },
  {
    name: "web",
    router: {
      routeByTokenIn: async (tokenIn, tokenOutDenom) =>
        (await routeTokenOutGivenIn({ token: tokenIn, tokenOutDenom })).quote,
    } as TokenOutGivenInRouter,
  },
];

export const swapRouter = createTRPCRouter({
  routeTokenOutGivenIn: publicProcedure
    .input(
      z.object({
        tokenInDenom: z.string(),
        tokenInAmount: z.string(),
        tokenOutDenom: z.string(),
        disabledRouterKeys: zodAvailableRouterKeys.optional(),
      })
    )
    .query(
      async ({
        input: {
          tokenInDenom,
          tokenInAmount,
          tokenOutDenom,
          disabledRouterKeys,
        },
      }) => {
        const router = await getTokenOutGivenInRouter(disabledRouterKeys);

        // send to router
        const quote = await router.routeByTokenIn(
          {
            denom: tokenInDenom,
            amount: new Int(tokenInAmount),
          },
          tokenOutDenom
        );

        // get asset configs
        const tokenInAsset = getAssetFromAssetList({
          coinMinimalDenom: tokenInDenom,
          assetLists: AssetLists,
        });

        if (!tokenInAsset)
          throw new Error(
            `Token in denom is not configured in asset list: ${tokenInDenom}`
          );

        const tokenOutAsset = getAssetFromAssetList({
          coinMinimalDenom: tokenOutDenom,
          assetLists: AssetLists,
        });

        if (!tokenOutAsset)
          throw new Error(
            `Token out denom is not configured in asset list: ${tokenOutDenom}`
          );

        // calculate fiat value of amounts
        // get fiat value
        const tokenInValue = await calcAssetValue({
          anyDenom: tokenInDenom,
          amount: new Int(tokenInAmount),
        });
        const tokenOutValue = await calcAssetValue({
          anyDenom: tokenOutDenom,
          amount: quote.amount,
        });
        const tokenInFeeAmountFiatValue =
          quote.tokenInFeeAmount && tokenInValue
            ? new PricePretty(DEFAULT_VS_CURRENCY, tokenInValue)
            : undefined;
        const tokenOutPricePretty = tokenOutValue
          ? new PricePretty(DEFAULT_VS_CURRENCY, tokenOutValue)
          : undefined;
        const amountFiatValue = tokenOutValue
          ? new PricePretty(DEFAULT_VS_CURRENCY, tokenOutValue)
          : undefined;

        // get pool type, in, and out currency for display
        const splitWithPoolInfos = await Promise.all(
          quote.split.map(async (split) => {
            const { pools, tokenInDenom, tokenOutDenoms } = split;
            const poolsWithInfos = await Promise.all(
              pools.map(async ({ id }, index) => {
                const poolRaw = (await queryPaginatedPools({ poolId: id }))
                  ?.pools[0];
                const pool = poolRaw
                  ? makeStaticPoolFromRaw(poolRaw)
                  : undefined;
                const inAsset = await getAsset({
                  anyDenom:
                    index === 0 ? tokenInDenom : tokenOutDenoms[index - 1],
                });
                const outAsset = await getAsset({
                  anyDenom: tokenOutDenoms[index],
                });

                return {
                  id,
                  type: pool?.type,
                  inCurrency: inAsset,
                  outCurrency: outAsset,
                };
              })
            );

            return {
              ...split,
              pools: poolsWithInfos,
            };
          })
        );

        return {
          ...quote,
          split: splitWithPoolInfos,
          amount: new CoinPretty(tokenOutAsset.currency, quote.amount),
          priceImpactTokenOut: quote.priceImpactTokenOut
            ? new RatePretty(quote.priceImpactTokenOut.abs())
            : undefined,
          tokenInFeeAmountFiatValue,
          swapFee: quote.swapFee ? new RatePretty(quote.swapFee) : undefined,
          tokenOutPrice: tokenOutPricePretty,
          amountFiatValue,
        };
      }
    ),
});

export async function getTokenOutGivenInRouter(
  disabledRouterKeys?: AvailableRouterKeys
) {
  const enabledRouters = routers.filter((router) => {
    if (IS_TESTNET) {
      // only these are supported on testnet envs.
      return router.name === "sidecar";
    }

    if (disabledRouterKeys) {
      return !disabledRouterKeys.includes(router.name);
    }
    return true;
  });

  return new BestRouteTokenInRouter(enabledRouters);
}
