import { Int } from "@keplr-wallet/unit";
import { Route, SplitTokenInQuote } from "@osmosis-labs/pools";
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

        return quoteToResponse(quote, candidateRoutes);
      }
    ),
});

type Response = {
  amount: string;
  candidateRoutes: {
    pools: {
      id: string;
    }[];
    tokenOutDenoms: string[];
    tokenInDenom: string;
  }[];
  split: {
    initialAmount: string;
    pools: {
      id: string;
    }[];
    tokenOutDenoms: string[];
    tokenInDenom: string;
  }[];
};

function quoteToResponse(
  quote: SplitTokenInQuote,
  candidateRoutes: Route[]
): Response {
  return {
    amount: quote.amount.toString(),
    candidateRoutes: candidateRoutes.map((route) => ({
      pools: route.pools.map((pool) => ({ id: pool.id })),
      tokenOutDenoms: route.tokenOutDenoms,
      tokenInDenom: route.tokenInDenom,
    })),
    split: quote.split.map((split) => {
      return {
        initialAmount: split.initialAmount.toString(),
        pools: split.pools.map((pool) => {
          return {
            id: pool.id,
          };
        }),
        tokenOutDenoms: split.tokenOutDenoms,
        tokenInDenom: split.tokenInDenom,
      };
    }),
  };
}
