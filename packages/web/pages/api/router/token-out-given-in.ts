import { Int } from "@keplr-wallet/unit";
import { Route, SplitTokenInQuote } from "@osmosis-labs/pools";
import type { NextApiRequest, NextApiResponse } from "next";

import { OsmosisSidecarRemoteRouter } from "~/integrations/sidecar/router";

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

export default async function routeTokenOutGivenIn(
  req: NextApiRequest,
  res: NextApiResponse<Response | string>
) {
  // parse request
  const { tokenInDenom, tokenInAmount, tokenOutDenom } = req.query;
  if (
    !tokenInDenom ||
    !tokenOutDenom ||
    !tokenInAmount ||
    typeof tokenInDenom !== "string" ||
    typeof tokenOutDenom !== "string" ||
    typeof tokenInAmount !== "string"
  ) {
    res.status(400).send("Missing parameters");
    return;
  }

  // get quote
  try {
    let router = new OsmosisSidecarRemoteRouter("https://sqsprod.osmosis.zone");

    const quote = await router.routeByTokenIn(
      { denom: tokenInDenom, amount: new Int(tokenInAmount) },
      tokenOutDenom
    );

    // return response
    const quoteResponse = quoteToResponse(quote, quote.split);
    res.status(200).json(quoteResponse);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
}

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
