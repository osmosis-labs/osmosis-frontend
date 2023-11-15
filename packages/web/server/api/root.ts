import { PoolsEdgeRouter } from "~/server/api/edge-routers/pools";
import { bridgeTransferRouter } from "~/server/api/routers/bridge-transfer";
import { createTRPCRouter } from "~/server/api/trpc";

import { AssetsEdgeRouter } from "./edge-routers/assets";

/**
 * This is the primary lambda router for our server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const edgeRouter = createTRPCRouter({
  pools: PoolsEdgeRouter,
  assets: AssetsEdgeRouter,
});
export const appRouter = createTRPCRouter({
  bridgeTransfer: bridgeTransferRouter,
  edge: edgeRouter,
});

export type AppRouter = typeof appRouter;
