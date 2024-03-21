import {
  concentratedLiquidityRouter,
  createTRPCRouter,
  swapRouter,
} from "@osmosis-labs/server";

import { edgeRouter } from "~/server/api/edge-router";
import { bridgeTransferRouter } from "~/server/api/routers/bridge-transfer";

/**
 * This section includes tRPC functions that execute on the client-side.
 * Caution: Ensure no sensitive data is exposed through these functions. */
export const localRouter = createTRPCRouter({
  quoteRouter: swapRouter,
  concentratedLiquidity: concentratedLiquidityRouter,
});

/** This is the primary lambda router for our server. */
export const appRouter = createTRPCRouter({
  bridgeTransfer: bridgeTransferRouter,
  edge: edgeRouter,
  local: localRouter,
});

export type AppRouter = typeof appRouter;
