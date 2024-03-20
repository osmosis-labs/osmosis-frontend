import { CoinPretty, Int, PricePretty, RatePretty } from "@keplr-wallet/unit";
import type {
  SplitTokenInQuote,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";
import { AssetList } from "@osmosis-labs/types";
import { z } from "zod";

import { SIDECAR_BASE_URL, TFM_BASE_URL } from "../env";
import {
  calcAssetValue,
  getAsset,
  getAssetPrice,
} from "../queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "../queries/complex/assets/config";
import { Pool } from "../queries/complex/pools";
import { getCosmwasmPoolTypeFromCodeId } from "../queries/complex/pools/env";
import { routeTokenOutGivenIn } from "../queries/complex/pools/route-token-out-given-in";
import { OsmosisSidecarRemoteRouter } from "../queries/sidecar/router";
import { TfmRemoteRouter } from "../queries/tfm/router";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { captureErrorAndReturn } from "../utils/error";

const zodAvailableRouterKey = z.enum(["tfm", "sidecar", "legacy"]);
export type RouterKey = z.infer<typeof zodAvailableRouterKey>;

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
        ctx,
      }) => {
        const osmosisChainId = ctx.chainList[0].chain_id;

        const routers: {
          name: RouterKey;
          router: TokenOutGivenInRouter;
        }[] = [
          {
            name: "tfm",
            router: new TfmRemoteRouter(
              osmosisChainId,
              TFM_BASE_URL ?? "https://api.tfm.com",
              (coinMinimalDenom, amount) =>
                calcAssetValue({ ...ctx, anyDenom: coinMinimalDenom, amount })
            ),
          },
          {
            name: "sidecar",
            router: new OsmosisSidecarRemoteRouter(
              SIDECAR_BASE_URL ?? "https://sqs.stage.osmosis.zone"
            ),
          },
          {
            name: "legacy",
            router: {
              routeByTokenIn: async (tokenIn, tokenOutDenom, forcePoolId) =>
                (
                  await routeTokenOutGivenIn({
                    ...ctx,
                    token: tokenIn,
                    tokenOutDenom,
                    forcePoolId,
                  })
                ).quote,
            } as TokenOutGivenInRouter,
          },
        ];

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

        const tokenOutAsset = getAsset({
          ...ctx,
          anyDenom: tokenOutDenom,
        });

        // calculate fiat value of amounts
        // get fiat value
        const tokenInFeeAmountValue = quote.tokenInFeeAmount
          ? await calcAssetValue({
              ...ctx,
              anyDenom: tokenInDenom,
              amount: quote.tokenInFeeAmount,
            }).catch((e) => captureErrorAndReturn(e, undefined))
          : undefined;
        const tokenOutPrice = await getAssetPrice({
          ...ctx,
          asset: { coinMinimalDenom: tokenOutDenom },
        }).catch((e) => captureErrorAndReturn(e, undefined));
        const tokenOutValue = await calcAssetValue({
          ...ctx,
          anyDenom: tokenOutDenom,
          amount: quote.amount,
        }).catch((e) => captureErrorAndReturn(e, undefined));
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
          split: makeDisplayableSplit(quote.split, ctx.assetLists),
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

      const inAsset = getAsset({
        assetLists,
        anyDenom: index === 0 ? tokenInDenom : tokenOutDenoms[index - 1],
      });
      const outAsset = getAsset({
        assetLists,
        anyDenom: tokenOutDenoms[index],
      });

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
