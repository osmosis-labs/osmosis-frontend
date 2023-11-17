/** Uses numerical cursor-based pagination that is compatible with
 *  useInfiniteQuery from trpc if applicable. Otherwise the given array is returned.
 *  Default cursor is 1 and default limit is 100.
 *
 *  See: https://trpc.io/docs/client/react/useInfiniteQuery
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

  cursor = cursor || 1;
  limit = limit || 100;
  const startIndex = (cursor - 1) * limit ?? 100;
  const paginatedItems = items.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    nextCursor: cursor++,
  };
}
