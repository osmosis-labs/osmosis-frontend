import { superjson } from "@osmosis-labs/server";
import { createServerSideHelpers } from "@trpc/react-query/server";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { appRouter } from "~/server/api/root-router";

/**
 * Creates tRPC helpers for SSR queries, useful for data prefetching.
 *
 * Create one per request: the helpers hold a query cache that `dehydrate()`
 * serializes in full, so a shared instance leaks every previously rendered
 * page's queries into the next page's props.
 */
export const createTrpcHelpers = () =>
  createServerSideHelpers({
    router: appRouter,
    ctx: {
      assetLists: AssetLists,
      chainList: ChainList,
    },
    transformer: superjson,
  });
