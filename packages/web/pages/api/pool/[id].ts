import { PoolRaw, queryPaginatedPools } from "~/queries/complex/pools";

type Response = {
  pool: PoolRaw;
};

export default async function pools(req: Request) {
  const url = new URL(req.url);
  const poolIdParam = url.searchParams.has("id")
    ? url.searchParams.get("id")
    : undefined;
  const poolId = Array.isArray(poolIdParam) ? poolIdParam[0] : poolIdParam;

  if (!poolId) return new Response("", { status: 400 });

  const { status, pools } = await queryPaginatedPools(
    undefined,
    undefined,
    poolId
  );

  if (pools && pools.length === 1) {
    const response: Response = { pool: pools[0] };
    return new Response(JSON.stringify(response), { status });
  }
  return new Response("", { status });
}

export const config = {
  runtime: "experimental-edge",
  regions: ["cdg1"], // Only execute this function in the Paris region
};
