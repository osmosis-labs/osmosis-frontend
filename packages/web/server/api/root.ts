import { edgeRouter } from "./edge-routers/edge-router";
import { localRouter } from "./local-routers/local-router";
import { bridgeTransferRouter } from "./routers/bridge-transfer";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary lambda router for our server.
 *
 * All routers added in /api/routers should be manually added here.
 */

export const appRouter = createTRPCRouter({
  bridgeTransfer: bridgeTransferRouter,
  edge: edgeRouter,
  local: localRouter,
});

export type AppRouter = typeof appRouter;
