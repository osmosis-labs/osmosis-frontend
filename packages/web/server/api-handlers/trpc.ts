import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { nodeRouter } from "~/server/api/node-router";
import { createTrpcContext } from "~/server/api/trpc";
import { readBodyText } from "~/server/api-handlers/request-body";

import { onTrpcError } from "./trpc-error-log";

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
    router: nodeRouter,
    req,
    createContext: createTrpcContext,
    onError: onTrpcError,
  });
}
