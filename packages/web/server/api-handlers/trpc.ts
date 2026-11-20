import {
  type FetchHandlerRequestOptions,
  fetchRequestHandler,
} from "@trpc/server/adapters/fetch";

import { edgeRouter } from "~/server/api/edge-router";
import { nodeRouter } from "~/server/api/node-router";
import { createTrpcContext } from "~/server/api/trpc";
import { readBodyText } from "~/server/api-handlers/request-body";
import { getAssetsCdnCacheControl } from "~/utils/trpc-cdn-cache";
import { constructEdgeUrlPathname } from "~/utils/trpc-edge";

import { onTrpcError } from "./trpc-error-log";

type TrpcRouter = typeof nodeRouter | typeof edgeRouter;

/**
 * Serves `router` at `endpoint` with the shared context and error logging.
 *
 * tRPC reads a request body itself without a limit, so a non-GET/HEAD body goes
 * through the same bounded read as the other routes first (413 when over it).
 */
async function serveTrpc<TRouter extends TrpcRouter>({
  endpoint,
  router,
  req,
  responseMeta,
}: {
  endpoint: string;
  router: TRouter;
  req: Request;
  responseMeta?: FetchHandlerRequestOptions<TRouter>["responseMeta"];
}): Promise<Response> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await readBodyText(req);
    if (body === undefined) {
      return Response.json({ error: "Request too large" }, { status: 413 });
    }
    req = new Request(req, { body });
  }

  return fetchRequestHandler<TRouter>({
    endpoint,
    router,
    req,
    responseMeta,
    createContext: createTrpcContext,
    onError: onTrpcError,
  });
}

/** `/api/trpc`: only the bridgeTransfer router (`nodeRouter`). */
export function trpcHandler(req: Request): Promise<Response> {
  return serveTrpc({ endpoint: "/api/trpc", router: nodeRouter, req });
}

export function edgeTrpcMainHandler(req: Request): Promise<Response> {
  return serveTrpc({
    endpoint: constructEdgeUrlPathname("main"),
    router: edgeRouter,
    req,
  });
}

/**
 * A separate edge endpoint for pools: its queries are expensive and would hold up the
 * others on the single JS thread.
 */
export function edgeTrpcPoolsHandler(req: Request): Promise<Response> {
  return serveTrpc({
    endpoint: constructEdgeUrlPathname("pools"),
    router: edgeRouter,
    req,
  });
}

/**
 * Asset queries, with a CDN `Cache-Control` for public ones. `responseMeta` does not
 * receive the request, so it closes over `req.url`.
 */
export function edgeTrpcAssetsHandler(req: Request): Promise<Response> {
  return serveTrpc({
    endpoint: constructEdgeUrlPathname("assets"),
    router: edgeRouter,
    req,
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
  });
}
