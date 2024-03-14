import { createTRPCRouter } from "~/server/api/trpc";

import { assetsRouter } from "./assets-router";
import { concentratedLiquidityRouter } from "./concentrated-liquidity-router";
import { swapRouter } from "./swap-router";

/**
 * This section includes tRPC functions that execute on the client-side.
 * Caution: Ensure no sensitive data is exposed through these functions.
 */
export const localRouter = createTRPCRouter({
  assets: assetsRouter,
  quote: swapRouter,
  concentratedLiquidity: concentratedLiquidityRouter,
});
