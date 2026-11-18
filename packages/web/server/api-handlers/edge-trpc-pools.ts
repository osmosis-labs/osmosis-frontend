import { captureError } from "@osmosis-labs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { edgeRouter } from "~/server/api/edge-router";
import { createTrpcContext } from "~/server/api/trpc";
import { constructEdgeUrlPathname } from "~/utils/trpc-edge";

/**
 * Create a separate api edge route for the pools edge server since its query is too expensive
 * and it's slowing the other queries down because of JS single threaded nature.
 */
export async function edgeTrpcPoolsHandler(req: Request) {
  return fetchRequestHandler({
    endpoint: constructEdgeUrlPathname("pools"),
    router: edgeRouter,
    req,
    createContext: createTrpcContext,
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
