import { edgeRouter } from "~/server/api/edge-routers/edge-router";
import { bridgeTransferRouter } from "~/server/api/routers/bridge-transfer";
import { createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  bridgeTransfer: bridgeTransferRouter,
  edge: edgeRouter,
});

export type AppRouter = typeof appRouter;
