import { Dec, Int } from "@keplr-wallet/unit";
import { z } from "zod";

export type Sort = Readonly<z.infer<typeof SortSchema>>;
export const SortSchema = z.object({
  keyPath: z.string(),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

/** Sorts a list of items by given sort params - a key and sort direction - into a new array.
 *  Includes handling for common complex types like Dec, Int, and it's *Pretty counterparts.
 *  Includes a custom compare function for sorting any other types which will override
 *  default behavior. */
export function sort<
  TItem extends Record<
    string,
    number | string | Dec | Int | { toDec(): Dec } | any
  >
>(
  list: TItem[],
  sort: Sort,
  compare?: (a: TItem, b: TItem) => number
): TItem[] {
  const keyPath = sort.keyPath;

  // validate keypath
  if (keyPath === undefined || list.length === 0 || !(keyPath in list[0])) {
    return list;
  }

  return list.toSorted((a, b) => {
    let aValue = a[keyPath];
    let bValue = b[keyPath];

    if (compare) return compare(a, b);

    // narrow type to Dec, helps handle comparing unlike types
    if (typeof aValue === "number") aValue = new Dec(aValue);
    if (typeof bValue === "number") bValue = new Dec(bValue);
    if (aValue instanceof Int) aValue = new Dec(aValue);
    if (bValue instanceof Int) bValue = new Dec(bValue);
    if (typeof aValue === "object" && "toDec" in aValue)
      aValue = aValue.toDec();
    if (typeof bValue === "object" && "toDec" in bValue)
      bValue = bValue.toDec();

    if (aValue instanceof Dec && bValue instanceof Dec) {
      return compareDec(aValue, bValue, sort.direction);
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue);
    }

    return 0;
  });
}

export function compareDec(
  a: Dec,
  b: Dec,
  direction: Sort["direction"]
): number {
  if (a.lt(b)) {
    return direction === "asc" ? -1 : 1;
  }
  if (a.gt(b)) {
    return direction === "asc" ? 1 : -1;
  }
  return 0;
}
