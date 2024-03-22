import Fuse from "fuse.js";
import { z } from "zod";

export type Search = Readonly<z.infer<typeof SearchSchema>>;
export const SearchSchema = z.object({
  query: z.string(),
  limit: z.number().optional(),
});

/** Searches a list of items by given search params - a query and limit - into a new array. */
export function search<TItem extends object>(
  data: TItem[],
  keys: string[],
  search: Search,
  threshold = 0.4
): TItem[] {
  const fuse = new Fuse(data, {
    keys,
    threshold,
  });

  return fuse
    .search(search.query)
    .map(({ item }) => item)
    .slice(0, search.limit);
}
