import { createTRPCRouter } from "@osmosis-labs/trpc";

import { mobileRouter } from "~/server/api/mobile-router";

import { edgeRouter } from "./edge-router";
import { localRouter } from "./local-router";
import { bridgeTransferRouter } from "./routers/bridge-transfer";

export const appRouter = createTRPCRouter({
  bridgeTransfer: bridgeTransferRouter,
  mobile: mobileRouter,
  edge: edgeRouter,
  local: localRouter,
});

export type AppRouter = typeof appRouter;
