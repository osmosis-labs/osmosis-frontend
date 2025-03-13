import {
  createTRPCRouter,
  mobileEdgeRouter,
  mobileNodeRouter,
} from "@osmosis-labs/trpc";

import { localRouter } from "./local-router";

export const appRouter = createTRPCRouter({
  local: localRouter,
  osmosisFeEdge: mobileEdgeRouter,
  osmosisFeNode: mobileNodeRouter,
});

export type AppRouter = typeof appRouter;
