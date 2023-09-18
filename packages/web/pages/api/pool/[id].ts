import type { NextApiRequest, NextApiResponse } from "next";

import { PoolRaw, queryPaginatedPools } from "~/queries/complex/pools";

type Response = {
  pool: PoolRaw;
};

export default async function pools(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const poolIdParam = "id" in req.query ? req.query["id"] : undefined;
  const poolId = Array.isArray(poolIdParam) ? poolIdParam[0] : poolIdParam;

  if (!poolId) return res.status(400);

  const { status, pools } = await queryPaginatedPools(
    undefined,
    undefined,
    poolId
  );

  if (pools && pools.length === 1) {
    return res.status(status).json({ pool: pools[0] });
  }
  return res.status(status);
}
