import { createTRPCRouter, gasRouter, swapRouter } from "@osmosis-labs/trpc";

/** Contains tRPC functions used by the mobile app. */
export const mobileRouter = createTRPCRouter({
  gas: gasRouter,
  quote: swapRouter,
});
