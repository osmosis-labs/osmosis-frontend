import { swapRouter } from "~/server/api/edge-routers/swap-router";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This section includes tRPC functions that execute on the client-side.
 * Caution: Ensure no sensitive data is exposed through these functions.
 */
export const localRouter = createTRPCRouter({
  quoteRouter: swapRouter,
});
