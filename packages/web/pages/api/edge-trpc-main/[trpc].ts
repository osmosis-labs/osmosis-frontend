import { captureError } from "@osmosis-labs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { edgeRouter } from "~/server/api/edge-router";
import { createEdgeTrpcContext } from "~/server/api/trpc";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";
import { constructEdgeUrlPathname } from "~/utils/trpc-edge";

async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: constructEdgeUrlPathname("main"),
    router: edgeRouter,
    req,
    createContext: createEdgeTrpcContext,
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
}

export default toNodeApiHandler(handler);

export const config = {
  api: { bodyParser: false },
};
