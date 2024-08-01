import { Dec } from "@keplr-wallet/unit";
import {
  CONCENTRATED_LIQ_POOL_TYPE,
  COSMWASM_POOL_TYPE,
  PoolRaw,
  STABLE_POOL_TYPE,
  WEIGHTED_POOL_TYPE,
} from "@osmosis-labs/pools/build/types";
import { getPools, queryNumPools } from "@osmosis-labs/server";
import { isNumeric } from "@osmosis-labs/utils";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";

/** @deprecated */
type Response = {
  pools: PoolRaw[];
  totalNumberOfPools: string;
  pageInfo?: {
    hasNextPage: boolean;
  };
};

/** @deprecated prefer tRPC pools procedures */
export default async function pools(req: Request) {
  const url = new URL(req.url);
  // This was legacy behavior
  // Ignore pagination and return all pools in a single array
  // const page = url.searchParams.has("page")
  //   ? Number(url.searchParams.get("page") as string)
  //   : 1;
  // const limit = url.searchParams.has("limit")
  //   ? Number(url.searchParams.get("limit") as string)
  //   : 100;
  const minimumLiquidity = isNumeric(url.searchParams.get("min_liquidity"))
    ? Number(url.searchParams.get("min_liquidity") as string)
    : undefined;

  const [pools, totalNumberOfPools] = await Promise.all([
    getPools({
      chainList: ChainList,
      assetLists: AssetLists,
      minLiquidityUsd: minimumLiquidity,
    }).then((r) =>
      r
        .map((pool) => {
          if (
            minimumLiquidity &&
            pool.totalFiatValueLocked.toDec().lt(new Dec(minimumLiquidity))
          ) {
            return;
          }

          if (pool.type === "weighted") {
            return {
              ...pool.raw,
              ["@type"]: WEIGHTED_POOL_TYPE,
            };
          } else if (pool.type === "stable") {
            return {
              ...pool.raw,
              ["@type"]: STABLE_POOL_TYPE,
            };
          } else if (pool.type === "concentrated") {
            return {
              ...pool.raw,
              ["@type"]: CONCENTRATED_LIQ_POOL_TYPE,
            };
          }
          return { ...pool.raw, ["@type"]: COSMWASM_POOL_TYPE };
        })
        .filter((pool): pool is PoolRaw => Boolean(pool))
    ),
    queryNumPools({ chainList: ChainList }).then((r) => r.num_pools),
  ]);
  const response: Response = { pools, totalNumberOfPools };

  if (pools) {
    return new Response(JSON.stringify(response), { status: 200 });
  }
  return new Response("", { status: 500 });
}

export const config = {
  runtime: "edge",
};
