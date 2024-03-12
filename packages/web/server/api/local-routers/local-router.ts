import { createTRPCRouter } from "~/server/api/trpc";

import { concentratedLiquidityRouter } from "./concentrated-liquidity-router";
import { swapRouter } from "./swap-router";

/**
 * This section includes tRPC functions that execute on the client-side.
 * Caution: Ensure no sensitive data is exposed through these functions.
 */
export const localRouter = createTRPCRouter({
  quoteRouter: swapRouter,
  concentratedLiquidity: concentratedLiquidityRouter,
});
