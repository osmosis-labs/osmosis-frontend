import { authenticatorsRouter } from "~/server/api/edge-routers/authenticators";
import { createTRPCRouter } from "~/server/api/trpc";

import { assetsRouter } from "./assets";
import { swapRouter } from "./swap-router";

/** Contains tRPC functions running on Vercel's edge network. */
export const edgeRouter = createTRPCRouter({
  quoteRouter: swapRouter,
  assets: assetsRouter,
  authenticators: authenticatorsRouter,
});
