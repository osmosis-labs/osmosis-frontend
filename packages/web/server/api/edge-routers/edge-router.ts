import { createTRPCRouter } from "~/server/api/trpc";

import { poolsRouter } from "./pools-router";
import { stakingRouter } from "./staking-router";

/** Contains tRPC functions running on Vercel's edge network. */
export const edgeRouter = createTRPCRouter({
  pools: poolsRouter,
  staking: stakingRouter,
});
