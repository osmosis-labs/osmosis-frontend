import { isNil } from "./common-utils";
import { CommonCompareType, compareCommon } from "./compare";

export type SortDirection = "asc" | "desc";

/** Sorts a list of objects by given sort params - a key and sort direction - into a new array.
 *  Includes handling for common complex types like Dec, Int, and it's *Pretty counterparts.
 *  Filters elements at the given `keyPath` that are `null` or `undefined`.
 *  Default `direction` is `"desc"`. */
export function sort<TItem extends Record<string, CommonCompareType | any>>(
  list: TItem[],
  keyPath: string,
  direction: SortDirection = "desc"
): TItem[] {
  // list is empty or keyPath is not in the list items, return items
  if (list.length === 0 || !getValueAtPath(list[0], keyPath)) {
    return list;
  }

  return list
    .filter((item) => !isNil(getValueAtPath(item, keyPath)))
    .sort((a, b) => {
      const aValue = keyPath.includes(".")
        ? getValueAtPath(a, keyPath)
        : a[keyPath];
      const bValue = keyPath.includes(".")
        ? getValueAtPath(b, keyPath)
        : b[keyPath];

      const commonCompare = withDirection(
        compareCommon(aValue, bValue),
        direction
      );
      if (commonCompare !== 0) return commonCompare;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return withDirection(aValue.localeCompare(bValue), direction);
      }

      return 0;
    });
}

/**
 * Gets the value of a property at the specified key path from a record.
 * @param record The record from which to get the value.
 * @param keyPath The key path (dot notation) for the property to get.
 * @returns The value at the specified key path or undefined if the path does not exist.
 */
export function getValueAtPath<
  TRecord extends Record<string, any>,
  TValue = any
>(record: TRecord, keyPath: string): TValue | undefined {
  const keys = keyPath.split(".");
  let result: any = record;
  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }
    result = result[key];
  }
  return result;
}

function withDirection(result: number, direction: SortDirection): number {
  if (direction === "desc") {
    return result;
  }
  return -result;
}
