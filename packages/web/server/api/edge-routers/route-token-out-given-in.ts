import { Int } from "@keplr-wallet/unit";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { routeTokenOutGivenIn } from "~/server/queries/complex/route-token-out-given-in";

export const RouteTokenOutGivenInRouter = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        tokenInDenom: z.string(),
        tokenInAmount: z.string(),
        tokenOutDenom: z.string(),
      })
    )
    .query(
      async ({ input: { tokenInDenom, tokenInAmount, tokenOutDenom } }) => {
        const { quote, candidateRoutes } = await routeTokenOutGivenIn(
          {
            denom: tokenInDenom,
            amount: new Int(tokenInAmount),
          },
          tokenOutDenom
        );

        return { quote, candidateRoutes };
      }
    ),
});
