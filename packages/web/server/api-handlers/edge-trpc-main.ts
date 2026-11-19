import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { edgeRouter } from "~/server/api/edge-router";
import { createTrpcContext } from "~/server/api/trpc";
import { constructEdgeUrlPathname } from "~/utils/trpc-edge";

import { onTrpcError } from "./trpc-error-log";

export async function edgeTrpcMainHandler(req: Request) {
  return fetchRequestHandler({
    endpoint: constructEdgeUrlPathname("main"),
    router: edgeRouter,
    req,
    createContext: createTrpcContext,
    onError: onTrpcError,
  });
}
