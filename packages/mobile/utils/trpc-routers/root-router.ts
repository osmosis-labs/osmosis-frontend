import { createTRPCRouter } from "@osmosis-labs/trpc";

import { localRouter } from "./local-router";
import { osmosisFeRouter } from "./osmosis-fe-router";

export const appRouter = createTRPCRouter({
  local: localRouter,
  osmosisFe: osmosisFeRouter,
});

export type AppRouter = typeof appRouter;
