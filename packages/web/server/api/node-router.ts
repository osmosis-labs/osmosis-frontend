import { createTRPCRouter } from "@osmosis-labs/trpc";

import { bridgeTransferRouter } from "./routers/bridge-transfer";

/**
 * The router served at `/api/trpc`. The browser client (`utils/trpc.ts`) sends
 * only `bridgeTransfer.*` there: `edge.*` goes to the `/api/edge-trpc-*`
 * endpoints and `local.*` runs in the browser. Serving `appRouter` would put
 * the local router's code in the API Worker for no caller.
 *
 * Paths match `appRouter`'s, so `AppRouter` stays the client's type.
 */
export const nodeRouter = createTRPCRouter({
  bridgeTransfer: bridgeTransferRouter,
});
