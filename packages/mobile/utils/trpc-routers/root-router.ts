import { createTRPCRouter } from "@osmosis-labs/trpc/build/api";
import { mobileEdgeRouter } from "@osmosis-labs/trpc/build/complex/mobile-edge-router";
import { mobileNodeRouter } from "@osmosis-labs/trpc/build/complex/mobile-node-router";

import { localRouter } from "./local-router";

export const appRouter = createTRPCRouter({
  local: localRouter,
  osmosisFeEdge: mobileEdgeRouter,
  osmosisFeNode: mobileNodeRouter,
});

export type AppRouter = typeof appRouter;
