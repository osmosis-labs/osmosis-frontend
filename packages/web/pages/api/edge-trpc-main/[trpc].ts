import { captureError } from "@osmosis-labs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";

import { edgeRouter } from "~/server/api/edge-router";
import { createEdgeTrpcContext } from "~/server/api/trpc";
import { constructEdgeUrlPathname } from "~/utils/trpc-edge";

// We're using the edge-runtime
export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
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
