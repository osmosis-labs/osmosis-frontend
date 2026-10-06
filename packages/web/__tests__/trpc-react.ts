import { createTRPCReact } from "@trpc/react-query";

import { AppRouter } from "~/server/api/root-router";

/**
 * tRPC v11 creates a separate React context per `createTRPCReact` instance,
 * so tests share this one between the test provider and the `api` mock in
 * `setup-tests.ts`.
 */
export const trpcReact = createTRPCReact<AppRouter>();
