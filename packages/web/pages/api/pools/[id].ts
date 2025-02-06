import {
  CONCENTRATED_LIQ_POOL_TYPE,
  COSMWASM_POOL_TYPE,
  PoolRaw,
  STABLE_POOL_TYPE,
  WEIGHTED_POOL_TYPE,
} from "@osmosis-labs/pools/build/types";
import { getPool } from "@osmosis-labs/server";
import { isNumeric } from "@osmosis-labs/utils";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";

type Response = {
  pool: PoolRaw;
};

export default async function pools(req: Request) {
  const url = new URL(req.url);
  const poolId = url.pathname.split("/").slice(-1)[0];

  if (!isNumeric(poolId))
    return new Response("Invalid pool id", { status: 400 });

  const pool = await getPool({
    chainList: ChainList,
    assetLists: AssetLists,
    poolId,
  }).then((pool) => {
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
  });
  const response: Response = { pool: pool as PoolRaw };
  return new Response(JSON.stringify(response), { status: 200 });
}

export const config = {
  runtime: "edge",
};
