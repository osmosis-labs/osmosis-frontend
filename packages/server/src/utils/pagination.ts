import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "./cache";

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
  nextCursor: number | null;
} {
  if (!cursor && !limit) return { items, nextCursor: null };

  cursor = cursor || 0;
  limit = limit || 50;
  const startIndex = cursor;

  // no more items if given an invalid cursor
  if (startIndex > items.length - 1) return { items: [], nextCursor: null };

  // get the page
  const page = items.slice(startIndex, startIndex + limit);

  return {
    items: page,
    nextCursor: cursor + limit > items.length - 1 ? null : cursor + limit,
  };
}

const paginationCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export type CachedPaginationParams<TItem> = {
  getFreshItems: () => Promise<TItem[]>;
  cacheKey: string;
  cursor?: number | null | undefined;
  limit?: number | null | undefined;
  ttl?: number;
};

/** Returns cached items while the user is paginating the list.
 *  If the input changes or the cursor is reset, the cache is invalidated.
 *  With useInfiniteQuery, the cursor will be reset to 0 when input to the query changes or the query is invalidated. */
export async function maybeCachePaginatedItems<TItem>({
  getFreshItems,
  cacheKey,
  cursor,
  limit,
  ttl = 30 * 1000, // 30 seconds
}: CachedPaginationParams<TItem>): Promise<{
  items: TItem[];
  nextCursor: number | null;
}> {
  // if pagination is not used, return items
  if (!cursor && !limit)
    return { items: await getFreshItems(), nextCursor: null };

  // If cursor is 0, delete the cache entry for the given key
  if (cursor === 0) {
    paginationCache.delete(cacheKey);
  }

  const items = await cachified({
    key: cacheKey,
    cache: paginationCache,
    ttl,
    getFreshValue: getFreshItems,
  });

  return maybeCursorPaginatedItems(items, cursor, limit);
}
