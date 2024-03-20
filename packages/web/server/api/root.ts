import {
  assetsRouter,
  concentratedLiquidityRouter,
  createTRPCRouter,
  earnRouter,
  poolsRouter,
  stakingRouter,
  swapRouter,
} from "@osmosis-labs/server";

import { bridgeTransferRouter } from "~/server/api/routers/bridge-transfer";

/** Contains tRPC functions running on Vercel's edge network. */
export const edgeRouter = createTRPCRouter({
  assets: assetsRouter,
  pools: poolsRouter,
  staking: stakingRouter,
  earn: earnRouter,
});

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
