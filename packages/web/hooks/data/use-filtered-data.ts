import { useState, useEffect } from "react";
import Fuse from "fuse.js";

/**
 * Manages the use of user input to filter (search) arbitrary data given a set object keys.
 *
 * Uses Fuse.js: https://fusejs.io/.
 *
 * @param data Data to filter/search on.
 * @param keys Object keys of a single data item to search on. For nested objects use dot syntax, e.g. `"fruit.shape"`. See: https://fusejs.io/api/options.html#keys.
 * @returns [current query, function to update query, search results data]
 */
export function useFilteredData<T>(
  data: T[],
  keys?: Fuse.FuseOptionKey[]
): [string, (terms: string) => void, T[]] {
  const [query, setQuery] = useState("");

  return [
    query,
    setQuery,
    query === ""
      ? data
      : new Fuse(data, { keys: keys, findAllMatches: true })
          .search(query)
          .map((result) => result.item),
  ];
}
