import type { NextApiRequest, NextApiResponse } from "next";

import { PoolRaw, queryPaginatedPools } from "~/queries/complex/pools";

type Response = {
  pools: PoolRaw[];
};

export default async function pools(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  // Default values for page and limit
  const page = "page" in req.query ? parseInt(req.query.page as string) : 1;
  const limit =
    "limit" in req.query ? parseInt(req.query.limit as string) : 100;

  const { status, pools } = await queryPaginatedPools(page, limit);

  if (pools) {
    return res.status(status).json({ pools });
  }
  return res.status(status);
}
