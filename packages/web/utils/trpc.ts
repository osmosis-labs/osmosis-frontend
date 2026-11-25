import { superjson } from "@osmosis-labs/server";
import { makeIndexedKVStore } from "@osmosis-labs/utils";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import {
  httpBatchLink,
  httpLink,
  loggerLink,
  type Operation,
  splitLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { type AppRouter } from "~/server/api/root-router";
import {
  isCdnCacheableAssetsQuery,
  setAssetsQueryDefaults,
} from "~/utils/trpc-cdn-cache";
import {
  constructEdgeRouterKey,
  constructEdgeUrlPathname,
  EdgeRouterKey,
} from "~/utils/trpc-edge";
import { PERSIST_BUSTER, shouldPersistQuery } from "~/utils/trpc-persist";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

/**
 * Splits a tRPC endpoint between single-operation `httpLink` and batched
 * `httpBatchLink` so expensive queries (`context.skipBatch`) and CDN-cacheable
 * queries (`shouldSkipBatch`) get their own unbatched requests.
 */
const makeSkipBatchLink = (
  url: string,
  shouldSkipBatch?: (op: Operation) => boolean
) =>
  splitLink({
    condition(op) {
      return op.context.skipBatch === true || Boolean(shouldSkipBatch?.(op));
    },
    true: httpLink({
      url,
      transformer: superjson,
    }),
    false: httpBatchLink({
      url,
      transformer: superjson,
      maxURLLength: 10_000,
    }),
  });

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  transformer: superjson,
  config() {
    const storage = makeIndexedKVStore("tanstack-query-cache");

    const localStoragePersister = createAsyncStoragePersister({
      storage:
        typeof window !== "undefined"
          ? {
              getItem: async (key) => {
                const item: string | null | undefined = await storage.get(key);
                return item ?? null;
              },
              setItem: (key, value) => storage.set(key, value),
              removeItem: (key) => storage.set(key, undefined),
            }
          : undefined,
      serialize: (client) => superjson.stringify(client),
      deserialize: (cachedString) => superjson.parse(cachedString),
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
      },
    });
    setAssetsQueryDefaults(queryClient);

    persistQueryClient({
      queryClient,
      persister: localStoragePersister,
      dehydrateOptions: {
        shouldDehydrateQuery: shouldPersistQuery,
      },
      // !! IMPORTANT !!
      // If you change a data model, bump PERSIST_BUSTER (utils/trpc-persist.ts)
      // so the old cache is dropped and data respecting the new model is
      // fetched from the server, instead of old data structures being run
      // through the app.
      buster: PERSIST_BUSTER,
    });

    return {
      queryClient,
      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NEXT_PUBLIC_TRPC_LOGS !== "off" &&
            (process.env.NODE_ENV === "development" ||
              (opts.direction === "down" && opts.result instanceof Error)),
        }),
        /**
         * Select the API Worker endpoint for each router. Procedures under
         * `local.*` now run on the API Worker (`/api/edge-trpc-local`) instead
         * of inside the browser bundle.
         */
        (runtime) => {
          // Initialize the links for the API endpoints.
          const servers = {
            node: makeSkipBatchLink(`${getBaseUrl()}/api/trpc`)(runtime),
            [constructEdgeRouterKey("main")]: makeSkipBatchLink(
              `${getBaseUrl()}${constructEdgeUrlPathname("main")}`
            )(runtime),
            local: makeSkipBatchLink(`${getBaseUrl()}/api/edge-trpc-local`)(
              runtime
            ),

            /**
             * Keep the existing per-router endpoints for API compatibility.
             *
             * Register new endpoints in api-worker/routes.ts and api-worker/handlers.ts.
             */
            [constructEdgeRouterKey("pools")]: makeSkipBatchLink(
              `${getBaseUrl()}${constructEdgeUrlPathname("pools")}`
            )(runtime),
            [constructEdgeRouterKey("assets")]: makeSkipBatchLink(
              `${getBaseUrl()}${constructEdgeUrlPathname("assets")}`,
              isCdnCacheableAssetsQuery
            )(runtime),
          };

          return (ctx) => {
            const { op } = ctx;

            const pathParts = op.path.split(".");
            const basePath = pathParts.shift() as string | "edge" | "local";

            /**
             * Combine the rest of the parts of the paths. This is what we're actually calling on the API Worker.
             * E.g. It will convert `edge.pools.getPool` to `pools.getPool`, and `local.cms.getTokenInfos` to `cms.getTokenInfos`.
             */
            const strippedPath = pathParts.join(".");

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

            return isEdge || isLocal
              ? link({
                  ...ctx,
                  op: {
                    ...op,
                    // override the target path with the prefix removed
                    path: strippedPath,
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
