import { captureError } from "@osmosis-labs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";

import { edgeRouter } from "~/server/api/edge-router";
import { createEdgeTrpcContext } from "~/server/api/trpc";
import { getAssetsCdnCacheControl } from "~/utils/trpc-cdn-cache";
import { constructEdgeUrlPathname } from "~/utils/trpc-edge";

// We're using the edge-runtime
export const config = {
  runtime: "edge",
};

/**
 * Create a separate api edge route for the pools edge server since its query is too expensive
 * and it's slowing the other queries down because of JS single threaded nature.
 */
export default async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: constructEdgeUrlPathname("assets"),
    router: edgeRouter,
    req,
    createContext: createEdgeTrpcContext,
    responseMeta: ({ paths, type, errors, data, eagerGeneration }) => {
      const cacheControl = getAssetsCdnCacheControl({
        url: req.url,
        paths,
        type,
        errorCount: errors.length,
        results: data,
        eagerGeneration,
      });
      // tRPC only sends `Vary: trpc-batch-mode` on streamed responses, so add
      // it here to keep a cached JSON batch from being served to a stream
      // request for the same URL.
      return cacheControl
        ? {
            headers: {
              "Cache-Control": cacheControl,
              Vary: "trpc-batch-mode",
            },
          }
        : {};
    },
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
