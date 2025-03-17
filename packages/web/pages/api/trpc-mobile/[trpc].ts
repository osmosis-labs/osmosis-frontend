import { captureError } from "@osmosis-labs/server";
import { mobileNodeRouter } from "@osmosis-labs/trpc/build/complex/mobile-node-router";
import { createNextApiHandler } from "@trpc/server/adapters/next";

import { createNextTrpcContext } from "~/server/api/trpc";

// export API handler
export default createNextApiHandler({
  router: mobileNodeRouter,
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
