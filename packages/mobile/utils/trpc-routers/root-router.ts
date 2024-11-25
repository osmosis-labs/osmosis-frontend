import { createTRPCRouter } from "@osmosis-labs/trpc";

import { localRouter } from "./local-router";

export const appRouter = createTRPCRouter({
  local: localRouter,
});

export type AppRouter = typeof appRouter;
