import { createTRPCRouter } from "~/server/api/trpc";

import { assetsRouter } from "./assets";
import { poolsEdgeRouter } from "./pools";
import { swapRouter } from "./swap-router";

/** Contains tRPC functions running on Vercel's edge network. */
export const edgeRouter = createTRPCRouter({
  pools: poolsEdgeRouter,
  quoteRouter: swapRouter,
  assets: assetsRouter,
});
