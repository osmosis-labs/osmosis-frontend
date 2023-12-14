import Fuse from "fuse.js";
import { z } from "zod";

export type Search = Readonly<z.infer<typeof SearchSchema>>;
export const SearchSchema = z.object({
  query: z.string(),
  limit: z.number().optional(),
});

export function search<TData extends Record<string, unknown>>(
  data: TData[],
  keys: string[],
  search: Search
): TData[] {
  const fuse = new Fuse(data, {
    keys,
    threshold: 0.2,
  });

  return fuse
    .search(search.query)
    .map(({ item }) => item)
    .slice(0, search.limit);
}
