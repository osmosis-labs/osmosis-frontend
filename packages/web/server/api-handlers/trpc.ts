import { captureError } from "@osmosis-labs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "~/server/api/root-router";
import { createTrpcContext } from "~/server/api/trpc";
import { readBodyText } from "~/server/api-handlers/request-body";

export async function trpcHandler(req: Request) {
  // tRPC reads the body itself without a limit, so mutation bodies go through
  // the same bounded read as the other routes first.
  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await readBodyText(req);
    if (body === undefined) {
      return Response.json({ error: "Request too large" }, { status: 413 });
    }
    req = new Request(req, { body });
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
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
