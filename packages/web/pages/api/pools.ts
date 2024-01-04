import { PoolRaw } from "@osmosis-labs/pools/build/types";

import { queryPaginatedPools } from "../../server/queries/complex/pools/providers/indexer";
import { isNumeric } from "../../utils/assertion";

type Response = {
  pools: PoolRaw[];
  totalNumberOfPools: string;
  pageInfo?: {
    hasNextPage: boolean;
  };
};

export default async function pools(req: Request) {
  const url = new URL(req.url);
  // Default values for page and limit
  const page = url.searchParams.has("page")
    ? Number(url.searchParams.get("page") as string)
    : 1;
  const limit = url.searchParams.has("limit")
    ? Number(url.searchParams.get("limit") as string)
    : 100;
  const minimumLiquidity = isNumeric(url.searchParams.get("min_liquidity"))
    ? Number(url.searchParams.get("min_liquidity") as string)
    : undefined;

  const { status, pools, totalNumberOfPools, pageInfo } =
    await queryPaginatedPools({
      page,
      limit,
      minimumLiquidity,
    });
  const response: Response = { pools, totalNumberOfPools, pageInfo };

  if (pools) {
    return new Response(JSON.stringify(response), { status });
  }
  return new Response("", { status });
}

export const config = {
  runtime: "edge",
  regions: ["cdg1"], // Only execute this function in the Paris region
};
