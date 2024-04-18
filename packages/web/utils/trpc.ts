import { localLink, makeSkipBatchLink, superjson } from "@osmosis-labs/server";
import { loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type {
  AnyProcedure,
  AnyRouter,
  inferRouterInputs,
  inferRouterOutputs,
} from "@trpc/server";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { type AppRouter, appRouter } from "~/server/api/root-router";
import {
  constructEdgeRouterKey,
  constructEdgeUrlPathname,
  EdgeRouterKey,
} from "~/utils/trpc-edge";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * Transformer used for data de-serialization from the server.
       *
       * @see https://trpc.io/docs/data-transformers
       */
      transformer: superjson,

      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        /**
         * Split calls to the node server and the edge server.
         * Edge server has some benefits over the node server:
         * - It's faster
         * - Has no cold starts
         *
         * However, the edge server does not have the node.js api available, so we can't use it for everything.
         * We'll use the edge server for simple fetches (E.g. getting pools) or calculations (E.g. calculating price).
         * We'll use the node server for things that require the node.js api (E.g. Creating transactions).
         */
        (runtime) => {
          // initialize the different links for different targets (edge and node)
          const servers = {
            node: makeSkipBatchLink(`${getBaseUrl()}/api/trpc`)(runtime),
            [constructEdgeRouterKey("main")]: makeSkipBatchLink(
              `${getBaseUrl()}${constructEdgeUrlPathname("main")}`
            )(runtime),
            local: localLink({
              router: appRouter,
              assetLists: AssetLists,
              chainList: ChainList,
            })(runtime),

            /**
             * Create a separate links for specific edge server routers since their queries are too expensive
             * and it's slowing the other queries down because of JS single threaded nature.
             *
             * If you add another key please remember to create the function on the
             * /pages/api/ folder with the following format: edge-trpc-[key]/[trpc].ts
             */
            [constructEdgeRouterKey("pools")]: makeSkipBatchLink(
              `${getBaseUrl()}${constructEdgeUrlPathname("pools")}`
            )(runtime),
            [constructEdgeRouterKey("assets")]: makeSkipBatchLink(
              `${getBaseUrl()}${constructEdgeUrlPathname("assets")}`
            )(runtime),
          };

          return (ctx) => {
            const { op } = ctx;

            const pathParts = op.path.split(".");
            const basePath = pathParts.shift() as string | "edge";

            /**
             * Combine the rest of the parts of the paths. This is what we're actually calling on the edge server.
             * E.g. It will convert `edge.pools.getPool` to `pools.getPool`
             */
            const possibleEdgePath = pathParts.join(".");

            /**
             * If the base path is not `edge`, we can just call the node server directly.
             */
            const isEdge = basePath === "edge";
            const isLocal = basePath === "local";

            let link: (typeof servers)["node"];
            if (isEdge) {
              link =
                servers[
                  constructEdgeRouterKey(pathParts[0] as EdgeRouterKey)
                ] ?? servers[constructEdgeRouterKey("main")]; // default to main edge server
            } else if (isLocal) {
              link = servers["local"];
            } else {
              link = servers["node"];
            }

            return isEdge
              ? link({
                  ...ctx,
                  op: {
                    ...op,
                    // override the target path with the prefix removed
                    path: possibleEdgePath,
                  },
                })
              : link(ctx);
          };
        },
      ],
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

type inferRouterKeys<TRouter extends AnyRouter, Prefix extends string = ""> = {
  [TKey in keyof TRouter["_def"]["record"]]: TRouter["_def"]["record"][TKey] extends infer TRouterOrProcedure
    ? TRouterOrProcedure extends AnyRouter
      ? inferRouterKeys<
          TRouterOrProcedure,
          `${Prefix}${TKey extends string ? TKey : never}.`
        >
      : TRouterOrProcedure extends AnyProcedure
      ? `${Prefix}${TKey extends string ? TKey : never}`
      : never
    : never;
}[keyof TRouter["_def"]["record"]];

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Inference helper for router keys.
 *
 * @example type HelloKey: RouterKeys = "local.quoteRouter.routeTokenOutGivenIn"
 */
export type RouterKeys = inferRouterKeys<AppRouter>;
