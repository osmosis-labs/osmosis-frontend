import { CoinPretty, Int, PricePretty, RatePretty } from "@keplr-wallet/unit";
import type {
  SplitTokenInQuote,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";
import { makeStaticPoolFromRaw } from "@osmosis-labs/pools/build/types";
import { z } from "zod";

import { ChainList } from "~/config/generated/chain-list";
import { OsmosisSidecarRemoteRouter } from "~/integrations/sidecar/router";
import { TfmRemoteRouter } from "~/integrations/tfm/router";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  calcAssetValue,
  getAsset,
  getAssetPrice,
} from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { queryPaginatedPools } from "~/server/queries/complex/pools/providers/indexer";
import { routeTokenOutGivenIn } from "~/server/queries/complex/pools/route-token-out-given-in";

const osmosisChainId = ChainList[0].chain_id;

const tfmBaseUrl = process.env.NEXT_PUBLIC_TFM_API_BASE_URL;

if (!tfmBaseUrl) console.error("TFM base url not set in env");

const sidecarBaseUrl = process.env.NEXT_PUBLIC_SIDECAR_BASE_URL;

if (!sidecarBaseUrl) console.error("Sidecar base url not set in env");

const zodAvailableRouterKey = z.enum(["tfm", "sidecar", "legacy"]);
export type RouterKey = z.infer<typeof zodAvailableRouterKey>;

const routers: {
  name: RouterKey;
  router: TokenOutGivenInRouter;
}[] = [
  {
    name: "tfm",
    router: new TfmRemoteRouter(
      osmosisChainId,
      tfmBaseUrl ?? "https://api.tfm.com",
      (coinMinimalDenom, amount) =>
        calcAssetValue({ anyDenom: coinMinimalDenom, amount })
    ),
  },
  {
    name: "sidecar",
    router: new OsmosisSidecarRemoteRouter(
      sidecarBaseUrl ?? "https://sqs.stage.osmosis.zone"
    ),
  },
  {
    name: "legacy",
    router: {
      routeByTokenIn: async (tokenIn, tokenOutDenom, forcePoolId) =>
        (
          await routeTokenOutGivenIn({
            token: tokenIn,
            tokenOutDenom,
            forcePoolId,
          })
        ).quote,
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
        preferredRouter: zodAvailableRouterKey,
        forcePoolId: z.string().optional(),
      })
    )
    .query(
      async ({
        input: {
          tokenInDenom,
          tokenInAmount,
          tokenOutDenom,
          preferredRouter,
          forcePoolId,
        },
      }) => {
        const { name, router } = routers.find(
          ({ name }) => name === preferredRouter
        )!;

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

        // validate assets
        if (!(await getAsset({ anyDenom: tokenInDenom }))) {
          throw new Error(
            `Token in denom is not configured in asset list: ${tokenInDenom}`
          );
        }
        const tokenOutAsset = await getAsset({ anyDenom: tokenOutDenom });
        if (!tokenOutAsset)
          throw new Error(
            `Token out denom is not configured in asset list: ${tokenOutDenom}`
          );

        // calculate fiat value of amounts
        // get fiat value
        const tokenInFeeAmountValue = quote.tokenInFeeAmount
          ? await calcAssetValue({
              anyDenom: tokenInDenom,
              amount: quote.tokenInFeeAmount,
            })
          : undefined;
        const tokenOutPrice = await getAssetPrice({
          asset: { coinMinimalDenom: tokenOutDenom },
        });
        const tokenOutValue = await calcAssetValue({
          anyDenom: tokenOutDenom,
          amount: quote.amount,
        });
        const tokenInFeeAmountFiatValue = tokenInFeeAmountValue
          ? new PricePretty(DEFAULT_VS_CURRENCY, tokenInFeeAmountValue)
          : undefined;
        const tokenOutPricePretty = tokenOutPrice
          ? new PricePretty(DEFAULT_VS_CURRENCY, tokenOutPrice)
          : undefined;
        const amountFiatValue = tokenOutValue
          ? new PricePretty(DEFAULT_VS_CURRENCY, tokenOutValue)
          : undefined;

        return {
          ...quote,
          split: await makeDisplayableSplit(quote.split),
          // supplementary data with display types
          name,
          timeMs,
          amount: new CoinPretty(tokenOutAsset, quote.amount),
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

/** Get pool type, in, and out currency for displaying the route in detail. */
async function makeDisplayableSplit(split: SplitTokenInQuote["split"]) {
  return await Promise.all(
    split.map(async (existingSplit) => {
      const { pools, tokenInDenom, tokenOutDenoms } = existingSplit;
      const poolsWithInfos = await Promise.all(
        pools.map(async (pool, index) => {
          const { id } = pool;
          const poolRaw = (await queryPaginatedPools({ poolId: id }))?.pools[0];
          const staticPool = poolRaw
            ? makeStaticPoolFromRaw(poolRaw)
            : undefined;
          const inAsset = await getAsset({
            anyDenom: index === 0 ? tokenInDenom : tokenOutDenoms[index - 1],
          });
          const outAsset = await getAsset({
            anyDenom: tokenOutDenoms[index],
          });

          return {
            ...pool,
            swapFee: staticPool?.swapFee,
            type: staticPool?.type,
            inCurrency: inAsset,
            outCurrency: outAsset,
          };
        })
      );

      return {
        ...existingSplit,
        pools: poolsWithInfos,
      };
    })
  );
}
