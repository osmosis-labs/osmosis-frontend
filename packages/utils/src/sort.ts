import { isNil } from "./common-utils";
import { CommonCompareType, compareCommon } from "./compare";

export type SortDirection = "asc" | "desc";

/** Sorts a list of objects by given sort params - a key and sort direction - into a new array.
 *  Includes handling for common complex types like Dec, Int, and it's *Pretty counterparts.
 *  Elements whose value at `keyPath` is `null` or `undefined` are kept and placed last,
 *  in their original order, whichever the direction: an unknown value must not hide the row.
 *  Callers that want to exclude unknown values must filter them out first.
 *  Default `direction` is `"desc"`. */
export function sort<TItem extends Record<string, CommonCompareType | any>>(
  list: TItem[],
  keyPath: string,
  direction: SortDirection = "desc"
): TItem[] {
  // list is empty, return items
  if (list.length === 0) {
    return list;
  }

  return [...list].sort((a, b) => {
    const aValue = getValueAtPath(a, keyPath);
    const bValue = getValueAtPath(b, keyPath);

    // nil values go last in either direction; `withDirection` must not flip them
    const nilCompare = compareCommon(aValue, bValue);
    if (isNil(aValue) || isNil(bValue)) return nilCompare;

    const commonCompare = withDirection(nilCompare, direction);
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
  TValue = any,
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
