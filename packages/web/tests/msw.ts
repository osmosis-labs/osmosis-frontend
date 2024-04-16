/* eslint-disable import/no-extraneous-dependencies */
import { superjson } from "@osmosis-labs/server";
import { setupServer } from "msw/node";
import { createTRPCMsw } from "msw-trpc";

import { AppRouter } from "~/server/api/root-router";

export const server = setupServer();
export const trpcMsw = createTRPCMsw<AppRouter>({
  transformer: { input: superjson, output: superjson },
});
