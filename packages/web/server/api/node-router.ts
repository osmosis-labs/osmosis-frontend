import { createTRPCRouter } from "@osmosis-labs/trpc";

import { bridgeTransferRouter } from "./routers/bridge-transfer";

/**
 * The router served at `/api/trpc`. The browser client (`utils/trpc.ts`) sends
 * only `bridgeTransfer.*` there: `edge.*` goes to `/api/edge-trpc-*` and
 * `local.*` goes to `/api/edge-trpc-local`.
 *
 * Paths match `AppRouter`'s `bridgeTransfer` namespace, so `AppRouter` stays
 * the client's type.
 */
export const nodeRouter = createTRPCRouter({
  bridgeTransfer: bridgeTransferRouter,
});
