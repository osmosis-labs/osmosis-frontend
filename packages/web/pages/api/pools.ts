import { PoolRaw, queryPaginatedPools } from "../../queries/complex/pools";

type Response = {
  pools: PoolRaw[];
};

export default async function pools(req: Request) {
  const url = new URL(req.url);
  // Default values for page and limit
  const page = url.searchParams.has("page")
    ? parseInt(url.searchParams.get("page") as string)
    : 1;
  const limit = url.searchParams.has("limit")
    ? parseInt(url.searchParams.get("limit") as string)
    : 100;

  const { status, pools } = await queryPaginatedPools(page, limit);
  const response: Response = { pools };

  if (pools) {
    return new Response(JSON.stringify(response), { status });
  }
  return new Response("", { status });
}

export const config = {
  runtime: "experimental-edge",
  regions: ["cdg1"], // Only execute this function in the Paris region
};
