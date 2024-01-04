import { PoolRaw } from "@osmosis-labs/pools/build/types";

import { queryPaginatedPools } from "~/server/queries/complex/pools/providers/indexer";
import { isNumeric } from "~/utils/assertion";

type Response = {
  pool: PoolRaw;
};

export default async function pools(req: Request) {
  const url = new URL(req.url);
  const poolId = url.pathname.split("/").slice(-1)[0];

  if (!isNumeric(poolId))
    return new Response("Invalid pool id", { status: 400 });

  try {
    const { status, pools } = await queryPaginatedPools({ poolId });
    if (pools && pools.length === 1) {
      const response: Response = { pool: pools[0] };
      return new Response(JSON.stringify(response), { status });
    }
  } catch (e) {
    const error = e as { status?: number };
    return new Response(
      error?.status === 404 ? "Not Found" : "Unexpected Error",
      {
        status: error?.status || 500,
      }
    );
  }
}

export const config = {
  runtime: "edge",
  regions: ["cdg1"], // Only execute this function in the Paris region
};
