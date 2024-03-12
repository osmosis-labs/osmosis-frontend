import { createTRPCRouter } from "~/server/api/trpc";

import { assetsRouter } from "./assets-router";
import { poolsRouter } from "./pools-router";
import { stakingRouter } from "./staking-router";

/** Contains tRPC functions running on Vercel's edge network. */
export const edgeRouter = createTRPCRouter({
  assets: assetsRouter,
  pools: poolsRouter,
  staking: stakingRouter,
});
