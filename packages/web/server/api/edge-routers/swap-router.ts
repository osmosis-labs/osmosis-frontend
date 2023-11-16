import { Int } from "@keplr-wallet/unit";
import { TokenOutGivenInRouter } from "@osmosis-labs/pools";
import { z } from "zod";

import { ChainList } from "~/config/generated/chain-list";
import { OsmosisSidecarRemoteRouter } from "~/integrations/sidecar/router";
import { TfmRemoteRouter } from "~/integrations/tfm/router";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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
  {
    name: "sidecar",
    router: new OsmosisSidecarRemoteRouter(
      process.env.NEXT_PUBLIC_SIDECAR_BASE_URL ?? "http://157.230.101.80:9092"
    ),
  },
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
        return await router.routeByTokenIn(
          {
            denom: tokenInDenom,
            amount: new Int(tokenInAmount),
          },
          tokenOutDenom
        );
      }
    ),
});
