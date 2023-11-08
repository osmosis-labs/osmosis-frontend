import { bridgeTransferRouter } from "~/server/api/routers/bridge-transfer";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bridgeTransfer: bridgeTransferRouter,
});

export type AppRouter = typeof appRouter;
