import type { createTRPCRouter } from "@osmosis-labs/trpc";

import type { edgeRouter } from "./edge-router";
import type { localRouter } from "./local-router";
import type { bridgeTransferRouter } from "./routers/bridge-transfer";

/**
 * Type-only union of the tRPC routers served by the API Worker (`/api/trpc`,
 * `/api/edge-trpc-*`, `/api/edge-trpc-local`). Kept type-only so the webapp
 * client and pages Worker never bundle server routers at runtime.
 */
export type AppRouter = ReturnType<
  typeof createTRPCRouter<{
    bridgeTransfer: typeof bridgeTransferRouter;
    edge: typeof edgeRouter;
    local: typeof localRouter;
  }>
>;
