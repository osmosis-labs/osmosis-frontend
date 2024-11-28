import { superjson } from "@osmosis-labs/server";
import {
  createTRPCRouter,
  localLink,
  makeSkipBatchLink,
} from "@osmosis-labs/trpc";
import { noop } from "@osmosis-labs/utils";
import { QueryClient } from "@tanstack/react-query";
import {
  PersistedClient,
  Persister,
  persistQueryClient,
  Promisable,
} from "@tanstack/react-query-persist-client";
import { loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type {
  AnyProcedure,
  AnyRouter,
  inferRouterInputs,
  inferRouterOutputs,
} from "@trpc/server";
import { get, set, values } from "idb-keyval";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { localRouter } from "~/server/api/local-router";
import { type AppRouter } from "~/server/api/root-router";
import { getOpentelemetryServiceName } from "~/utils/service-name";
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

/**
 * Create a minimal local router to avoid importing
 * server packages in the client.
 */
const trpcLocalRouter = createTRPCRouter({
  local: localRouter,
});

interface AsyncThrottleOptions {
  interval?: number;
  onError?: (error: unknown) => void;
}

function asyncThrottle<Args extends readonly unknown[]>(
  func: (...args: Args) => Promise<void>,
  { interval = 1000, onError = noop }: AsyncThrottleOptions = {}
) {
  if (typeof func !== "function") throw new Error("argument is not function.");

  let running = false;
  let lastTime = 0;
  let timeout: ReturnType<typeof setTimeout>;
  let currentArgs: Args | null = null;

  const execFunc = async () => {
    if (currentArgs) {
      const args = currentArgs;
      currentArgs = null;
      try {
        running = true;
        await func(...args);
      } catch (error) {
        onError(error);
      } finally {
        lastTime = Date.now(); // this line must after 'func' executed to avoid two 'func' running in concurrent.
        running = false;
      }
    }
  };

  const delayFunc = async () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (running) {
        delayFunc(); // Will come here when 'func' execution time is greater than the interval.
      } else {
        execFunc();
      }
    }, interval);
  };

  return (...args: Args) => {
    currentArgs = args;

    const tooSoon = Date.now() - lastTime < interval;
    if (running || tooSoon) {
      delayFunc();
    } else {
      execFunc();
    }
  };
}

interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
  removeItem: (key: string) => Promise<void>;
  values: () => Promise<string[]>;
}

type AsyncPersistRetryer = (props: {
  persistedClient: PersistedClient;
  error: Error;
  errorCount: number;
}) => Promisable<PersistedClient | undefined>;

interface CreateAsyncStoragePersisterOptions {
  /** The storage client used for setting and retrieving items from cache.
   * For SSR pass in `undefined`. Note that window.localStorage can be
   * `null` in Android WebViews depending on how they are configured.
   */
  storage: AsyncStorage | undefined | null;
  /** The key to use when storing the cache */
  key?: string;
  /** To avoid spamming,
   * pass a time in ms to throttle saving the cache to disk */
  throttleTime?: number;
  retry?: AsyncPersistRetryer;
}

const createAsyncStoragePersister = ({
  storage,
  key = `REACT_QUERY_OFFLINE_CACHE`,
  throttleTime = 1000,
  retry,
}: CreateAsyncStoragePersisterOptions): Persister => {
  if (storage) {
    const trySave = async (
      persistedClient: PersistedClient
    ): Promise<Error | undefined> => {
      try {
        for (const query of persistedClient.clientState.queries) {
          storage.setItem(query.queryKey.join("-"), superjson.stringify(query));
        }

        const clientState = {
          buster: persistedClient.buster,
          timestamp: persistedClient.timestamp,
        };

        await storage.setItem(key, JSON.stringify(clientState));
        return;
      } catch (error) {
        return error as Error;
      }
    };

    return {
      persistClient: asyncThrottle(
        async (persistedClient) => {
          let client: PersistedClient | undefined = persistedClient;
          let error = await trySave(client);
          let errorCount = 0;
          while (error && client) {
            errorCount++;
            client = await retry?.({
              persistedClient: client,
              error,
              errorCount,
            });

            if (client) {
              error = await trySave(client);
            }
          }
        },
        { interval: throttleTime }
      ),
      restoreClient: async () => {
        const cacheClientStateString = await storage.getItem(key);

        if (!cacheClientStateString) {
          return;
        }

        const queriesString = await storage.values();
        const queries = queriesString.map(
          superjson.parse<PersistedClient["clientState"]["queries"][0]>
        );
        const client: PersistedClient = JSON.parse(cacheClientStateString);

        return {
          ...client,
          clientState: {
            queries,
            mutations: [],
          },
        } as PersistedClient;
      },
      removeClient: () => storage.removeItem(key),
    };
  }

  return {
    persistClient: noop,
    restoreClient: () => Promise.resolve(undefined),
    removeClient: noop,
  };
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    /* const storage = makeIndexedKVStore("tanstack-query-cache"); */

    const localStoragePersister = createAsyncStoragePersister({
      storage:
        typeof window !== "undefined"
          ? {
              getItem: async (key) => {
                const item: string | null | undefined = await get(key);
                return item ?? null;
              },
              setItem: (key, value) => set(key, value),
              removeItem: (key) => set(key, undefined),
              values: () => values(),
            }
          : undefined,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          cacheTime: 1000 * 60 * 60 * 24, // 24 hours
        },
      },
    });

    persistQueryClient({
      queryClient,
      persister: localStoragePersister,
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          const [key] = query.queryKey as [string[]];
          if (Array.isArray(key)) {
            const trpcKey = key.join(".") as RouterKeys;
            const excludedKeys: RouterKeys[] = [
              "local.bridgeTransfer.getSupportedAssetsBalances",
              "bridgeTransfer.getDepositAddress",
            ];

            /**
             * If the key is in the excludedKeys, we don't want to persist it in the cache.
             */
            if (excludedKeys.includes(trpcKey)) {
              return false;
            }
          }
          return true;
        },
      },
      // !! IMPORTANT !!
      // If you change a data model,
      // it's important to bump this buster value
      // so that the cache is invalidated
      // and data respecting the new model is fetched from the server.
      // Otherwise, the old data will be served from cache
      // and unexpected data structures will be run through the app.
      buster: "v1",
    });

    return {
      queryClient,
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
            process.env.NEXT_PUBLIC_TRPC_LOGS !== "off" &&
            (process.env.NODE_ENV === "development" ||
              (opts.direction === "down" && opts.result instanceof Error)),
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
              router: trpcLocalRouter,
              assetLists: AssetLists,
              chainList: ChainList,
              opentelemetryServiceName: getOpentelemetryServiceName(),
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
type RouterKeys = inferRouterKeys<AppRouter>;
