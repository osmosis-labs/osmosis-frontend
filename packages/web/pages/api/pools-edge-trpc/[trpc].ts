import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";

import { edgeRouter } from "~/server/api/edge-routers/edge-router";
import { createEdgeTRPCContext } from "~/server/api/trpc";

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
    endpoint: "/api/pools-edge-trpc",
    router: edgeRouter,
    req,
    createContext: createEdgeTRPCContext,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });
}
