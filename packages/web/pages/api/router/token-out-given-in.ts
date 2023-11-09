import { Dec, Int } from "@keplr-wallet/unit";
import {
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolRaw,
  CosmwasmPoolRaw,
  FetchTickDataProvider,
  OptimizedRoutes,
  SplitTokenInQuote,
  StablePool,
  StablePoolRaw,
  TokenOutGivenInRouter,
  TransmuterPool,
  WeightedPool,
  WeightedPoolRaw,
} from "@osmosis-labs/pools";
import type { NextApiRequest, NextApiResponse } from "next";

import { ChainInfos } from "~/config";
import { queryPaginatedPools } from "~/queries/complex/pools";
import { queryNumPools } from "~/queries/osmosis";

type Response = {
  amount: string;
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
  const url = new URL(req.url);
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
  const router = await getRouter();
  const quote = await router.routeByTokenIn(
    { amount: new Int(tokenInAmount), denom: tokenInDenom },
    tokenOutDenom
  );

  // return response
  const quoteResponse = quoteToResponse(quote);
  res.status(200).json(quoteResponse);
}

async function getRouter(): Promise<TokenOutGivenInRouter> {
  // fetch pool data
  const numPoolsResponse = await queryNumPools();
  const poolsResponse = await queryPaginatedPools({
    page: 1,
    limit: Number(numPoolsResponse.num_pools),
    minimumLiquidity: 0,
  });

  // create routable pool impls from response
  const routablePools = poolsResponse.pools
    .map((pool) => {
      if (pool["@type"] === "/osmosis.concentratedliquidity.v1beta1.Pool") {
        pool = pool as ConcentratedLiquidityPoolRaw;
        return new ConcentratedLiquidityPool(
          pool,
          new FetchTickDataProvider(ChainInfos[0].rest, pool.id)
        );
      }

      if (pool["@type"] === "/osmosis.gamm.v1beta1.Pool") {
        return new WeightedPool(pool as WeightedPoolRaw);
      }

      if (
        pool["@type"] === "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool"
      ) {
        return new StablePool(pool as StablePoolRaw);
      }

      if (pool["@type"] === "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool") {
        return new TransmuterPool(pool as CosmwasmPoolRaw);
      }
    })
    .filter(
      (
        pool
      ): pool is
        | ConcentratedLiquidityPool
        | WeightedPool
        | StablePool
        | TransmuterPool => pool !== undefined
    );

  // prep router params
  const preferredPoolIds = routablePools.reduce((preferredPoolIds, pool) => {
    if (pool.type === "concentrated") {
      preferredPoolIds.push(pool.id);
    }
    if (pool.type === "transmuter") {
      preferredPoolIds.unshift(pool.id);
    }

    return preferredPoolIds;
  }, [] as string[]);
  const getPoolTotalValueLocked = (poolId: string) => {
    const pool = poolsResponse.pools.find((pool) =>
      "pool_id" in pool ? pool.pool_id : pool.id === poolId
    );
    if (!pool) {
      console.warn("No pool found for pool", poolId);
      return new Dec(0);
    }
    if (!pool.liquidityUsd) {
      console.warn("No TVL found for pool", poolId);
      return new Dec(0);
    } else return new Dec(pool.liquidityUsd.toString());
  };

  return new OptimizedRoutes({
    pools: routablePools,
    preferredPoolIds,
    getPoolTotalValueLocked,
  });
}

function quoteToResponse(quote: SplitTokenInQuote): Response {
  return {
    amount: quote.amount.toString(),
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
