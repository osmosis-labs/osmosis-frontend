import { getPool, PoolRawResponse } from "@osmosis-labs/server";
import { isNumeric } from "@osmosis-labs/utils";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { toLegacyPoolResponse } from "~/server/api/legacy-pool-response";

type Response = {
  pool: PoolRawResponse;
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
  }).then(toLegacyPoolResponse);
  const response: Response = { pool };
  return new Response(JSON.stringify(response), { status: 200 });
}

export const config = {
  runtime: "edge",
};
