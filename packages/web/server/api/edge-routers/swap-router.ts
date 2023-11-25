import { CoinPretty, Int, PricePretty } from "@keplr-wallet/unit";
import type { TokenOutGivenInRouter } from "@osmosis-labs/pools";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { z } from "zod";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { DEFAULT_VS_CURRENCY } from "~/config/price";
// import { OsmosisSidecarRemoteRouter } from "~/integrations/sidecar/router";
import { TfmRemoteRouter } from "~/integrations/tfm/router";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAssetPrice } from "~/server/queries/complex/assets";
import { routeTokenOutGivenIn } from "~/server/queries/complex/route-token-out-given-in";
import { BestRouteTokenInRouter } from "~/utils/routing/best-route-router";

const osmosisChainId = ChainList[0].chain_id;

const routers = [
  {
    name: "tfm",
    router: new TfmRemoteRouter(
      osmosisChainId,
      process.env.NEXT_PUBLIC_TFM_API_BASE_URL ?? "https://api.tfm.com"
    ),
  },
  // {
  //   name: "sidecar",
  //   router: new OsmosisSidecarRemoteRouter(
  //     process.env.NEXT_PUBLIC_SIDECAR_BASE_URL ?? "http://157.230.101.80:9092"
  //   ),
  // },
  {
    name: "web",
    router: {
      routeByTokenIn: async (tokenIn, tokenOutDenom) =>
        (await routeTokenOutGivenIn(tokenIn, tokenOutDenom)).quote,
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
      })
    )
    .query(
      async ({ input: { tokenInDenom, tokenInAmount, tokenOutDenom } }) => {
        const router = new BestRouteTokenInRouter(routers);
        const quote = await router.routeByTokenIn(
          {
            denom: tokenInDenom,
            amount: new Int(tokenInAmount),
          },
          tokenOutDenom
        );

        const tokenInPrice = await getAssetPrice({
          asset: { coinMinimalDenom: tokenInDenom },
        });
        const tokenOutPrice = await getAssetPrice({
          asset: { coinMinimalDenom: tokenOutDenom },
        });

        const tokenInFeeAmountFiatValue =
          quote.tokenInFeeAmount && tokenInPrice
            ? new PricePretty(
                DEFAULT_VS_CURRENCY,
                quote.tokenInFeeAmount.toDec().mul(tokenInPrice)
              )
            : undefined;

        const tokenOutPricePretty = tokenOutPrice
          ? new PricePretty(DEFAULT_VS_CURRENCY, tokenOutPrice)
          : undefined;

        const amountFiatValue = tokenOutPrice
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              quote.amount.toDec().mul(tokenOutPrice)
            )
          : undefined;

        const tokenOutAsset = getAssetFromAssetList({
          coinMinimalDenom: tokenOutDenom,
          assetLists: AssetLists,
        });

        if (!tokenOutAsset)
          throw new Error(
            `Token out denom is not configured in asset list: ${tokenOutDenom}`
          );

        return {
          ...quote,
          amount: new CoinPretty(tokenOutAsset.currency, quote.amount),
          tokenInFeeAmountFiatValue,
          tokenOutPrice: tokenOutPricePretty,
          amountFiatValue,
        };
      }
    ),
});
