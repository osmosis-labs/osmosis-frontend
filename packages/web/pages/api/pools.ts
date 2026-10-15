import { getPools, PoolRawResponse, queryNumPools } from "@osmosis-labs/server";
import { Dec } from "@osmosis-labs/unit";
import { isNumeric } from "@osmosis-labs/utils";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { toLegacyPoolResponse } from "~/server/api/legacy-pool-response";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

/** @deprecated */
type Response = {
  pools: PoolRawResponse[];
  totalNumberOfPools: string;
  pageInfo?: {
    hasNextPage: boolean;
  };
};

/** @deprecated prefer tRPC pools procedures */
async function pools(req: Request) {
  const url = new URL(req.url);
  // Legacy behavior: pagination params are ignored and all pools returned.
  const minimumLiquidity = isNumeric(url.searchParams.get("min_liquidity"))
    ? Number(url.searchParams.get("min_liquidity") as string)
    : undefined;

  const [pools, totalNumberOfPools] = await Promise.all([
    getPools({
      chainList: ChainList,
      assetLists: AssetLists,
      minLiquidityUsd: minimumLiquidity,
    }).then((r) =>
      r?.items
        .filter(
          (pool) =>
            !minimumLiquidity ||
            !pool.totalFiatValueLocked.toDec().lt(new Dec(minimumLiquidity))
        )
        .map(toLegacyPoolResponse)
    ),
    queryNumPools({ chainList: ChainList }).then((r) => r.num_pools),
  ]);
  const response: Response = { pools, totalNumberOfPools };

  if (pools) {
    return new Response(JSON.stringify(response), {
      status: 200,
      headers:
        pools.length > 0
          ? { "Cache-Control": "public, s-maxage=60" }
          : undefined,
    });
  }
  return new Response("", { status: 500 });
}

export default toNodeApiHandler(pools);

export const config = {
  api: { bodyParser: false },
};
