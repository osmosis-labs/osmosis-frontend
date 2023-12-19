import "~/utils/superjson";

import { httpBatchLink, httpLink, loggerLink, splitLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

import { type AppRouter } from "~/server/api/root";
import { superjson } from "~/utils/superjson";

const getBaseUrl = () => {
  if (typeof window !== "undefined")
    return process.env.NEXT_PUBLIC_WEB_API_BASE_URL ?? ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

/** Provides ability to skip batching given a new custom query option context: `skipBatch: boolean` */
const makeSkipBatchLink = (url: string) =>
  splitLink({
    condition(op) {
      // check for context property `skipBatch`
      return op.context.skipBatch === true;
    },
    // when condition is true, use normal request
    true: httpLink({
      url,
    }),
    // when condition is false, use batching
    false: httpBatchLink({
      url,
    }),
  });

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
            edge: makeSkipBatchLink(`${getBaseUrl()}/api/edge-trpc`)(runtime),
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
            const link = isEdge ? servers["edge"] : servers["node"];

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
