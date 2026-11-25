import { LRUCache } from "lru-cache";
import { z } from "zod";

import { cached, type CacheEntry } from "./cached";

/** Include this in your function's input, and return the correct `nextCursor` value
 *  to automatically get pagination support for your query function via `useInfiniteQuery` tRPC hook.
 *
 *  See: https://trpc.io/docs/client/react/useInfiniteQuery
 */
export const CursorPaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).nullish(),
  cursor: z.number().int().min(0).nullish(),
});

/** Uses numerical cursor-based pagination that is compatible with and similar to offest pagination.
 *  This means if you have a cursor of 50 and a limit of 20, you will get items 50-69.
 *  Also, you should rerequest all data if it changes, as the cursor is not a pointer to a page, but to an item index.
 *  useInfiniteQuery from trpc if applicable. Otherwise the given array is returned.
 *  Default cursor is 0 and default limit is 50.
 *  The cursor doesn't point to the page, but to the item index of the last element of the requested page.
 *  The limit is the number of items per page.
 *  If `nextCursor` is null, there are no more items.
 *
 *  See: https://trpc.io/docs/client/react/useInfiniteQuery
 *  Guide: https://tanstack.com/query/v4/docs/react/guides/infinite-queries
 */
export function maybeCursorPaginatedItems<TItem>(
  items: TItem[],
  cursor: number | null | undefined,
  limit: number | null | undefined
): {
  items: TItem[];
  nextCursor: number | undefined;
} {
  if (!cursor && !limit) return { items, nextCursor: undefined };

  cursor = Math.max(0, cursor || 0);
  limit = limit || 50;
  const startIndex = cursor;

  // no more items if given an invalid cursor
  if (startIndex > items.length - 1)
    return { items: [], nextCursor: undefined };

  // get the page
  const page = items.slice(startIndex, startIndex + limit);

  return {
    items: page,
    nextCursor: cursor + limit > items.length - 1 ? undefined : cursor + limit,
  };
}

/**
 * Size-bounded LRU for paginated lists. Each entry holds a full unpaginated
 * array (up to ~1,350 hydrated asset objects); bounding by total item count
 * rather than entry count keeps the cache well inside a Cloudflare Worker's
 * 128 MB heap even under diverse search/address traffic.
 */
const paginationCache = new LRUCache<string, CacheEntry>({
  max: 100,
  maxSize: 15_000,
  sizeCalculation: (entry) => {
    const items = (entry.value as { items?: unknown[] } | undefined)?.items;
    return Array.isArray(items) ? items.length + 1 : 1;
  },
});

export type CachedPaginationParams<TItem> = {
  /** Call `markIncomplete` when the list is known to be missing items (e.g. one data
   *  source failed): the result then carries `incomplete: true`, on later pages too. */
  getFreshItems: (context: { markIncomplete: () => void }) => Promise<TItem[]>;
  /** Unique across all callers: the cache is shared, so prefix it with the procedure. */
  cacheKey: string;
  /** Fetch the list again when the first page (cursor 0) is requested, so a reload
   *  shows changes right away. Only for lists scoped to one user (balances, orders),
   *  which change with the user's own actions: a shared list would be refetched on
   *  every user's first page, and the ttl governs its freshness instead. */
  reloadOnFirstPage?: boolean;
  cursor?: number | null | undefined;
  limit?: number | null | undefined;
  ttl?: number;
};

/** Returns cached items while the user is paginating the list.
 *  The list is cached per key for the ttl. With `reloadOnFirstPage`, a reset cursor also
 *  refetches it: with useInfiniteQuery, the cursor is reset to 0 when input to the query
 *  changes or the query is invalidated. */
export async function maybeCachePaginatedItems<TItem>({
  getFreshItems,
  cacheKey,
  cursor,
  limit,
  ttl = 30 * 1000, // 30 seconds
  reloadOnFirstPage = false,
}: CachedPaginationParams<TItem>): Promise<{
  items: TItem[];
  nextCursor: number | undefined;
  /** Present (true) only when the list is missing items, see `markIncomplete`. */
  incomplete?: true;
}> {
  // if pagination is not used, return items
  if (!cursor && !limit) {
    let incomplete = false;
    const items = await getFreshItems({
      markIncomplete: () => {
        incomplete = true;
      },
    });
    return {
      items,
      nextCursor: undefined,
      ...(incomplete ? { incomplete: true as const } : {}),
    };
  }

  if (reloadOnFirstPage && cursor === 0) {
    paginationCache.delete(cacheKey);
  }

  // The incomplete flag is cached with its list, so later pages are cut from the same
  // snapshot as the first and every request sharing a fetch reports that fetch's status.
  // A reload (cursor 0) of a `reloadOnFirstPage` list fetches again.
  const { items, incomplete } = await cached({
    key: cacheKey,
    cache: paginationCache,
    ttl,
    getFreshValue: async () => {
      let incomplete = false;
      const items = await getFreshItems({
        markIncomplete: () => {
          incomplete = true;
        },
      });
      return { items, incomplete };
    },
  });

  return {
    ...maybeCursorPaginatedItems(items, cursor, limit),
    ...(incomplete ? { incomplete: true as const } : {}),
  };
}
