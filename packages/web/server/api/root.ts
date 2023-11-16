import { bridgeTransferRouter } from "~/server/api/routers/bridge-transfer";
import { createTRPCRouter } from "~/server/api/trpc";

import { assetsRouter } from "./edge-routers/assets";
import { poolsEdgeRouter } from "./edge-routers/pools";
import { swapRouter } from "./edge-routers/swap-router";

/**
 * This is the primary lambda router for our server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const edgeRouter = createTRPCRouter({
  pools: poolsEdgeRouter,
  quoteRouter: swapRouter,
  assets: assetsRouter,
});
export const appRouter = createTRPCRouter({
  bridgeTransfer: bridgeTransferRouter,
  edge: edgeRouter,
});

export type AppRouter = typeof appRouter;
