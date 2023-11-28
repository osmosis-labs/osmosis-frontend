/** Uses numerical cursor-based pagination that is compatible with
 *  useInfiniteQuery from trpc if applicable. Otherwise the given array is returned.
 *  Default cursor is 50 and default limit is 50.
 *  The cursor doesn't point to the page, but to the item index of the last element of the requested page.
 *  The limit is the number of items per page.
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
  nextCursor: number;
} {
  if (!cursor && !limit) return { items, nextCursor: 0 };

  cursor = cursor || 50;
  limit = limit || 50;
  const startIndex = cursor - limit;
  const paginatedItems = items.slice(startIndex, limit);

  return {
    items: paginatedItems,
    nextCursor: cursor + limit,
  };
}
