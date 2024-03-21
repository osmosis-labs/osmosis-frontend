import { captureError } from "@osmosis-labs/server";
import { createNextApiHandler } from "@trpc/server/adapters/next";

import { appRouter } from "~/server/api/root-router";
import { createNextTrpcContext } from "~/server/api/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createNextTrpcContext,
  onError:
    process.env.NODE_ENV === "development"
      ? ({ path, error }) => {
          captureError(error);
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});
