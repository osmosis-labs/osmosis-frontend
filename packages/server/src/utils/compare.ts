import { Dec, Int } from "@keplr-wallet/unit";
import { isNil } from "@osmosis-labs/utils";

export type CommonCompareType =
  | number
  | string
  | Dec
  | Int
  | Date
  | { toDec(): Dec }
  | null
  | undefined;
/** -1: a before b, 1: b before a, 0: do nothing. */
export type CompareResult = -1 | 1 | 0;

/** Compare common comparable types used in app. Useful with sort function.
 *  Prefers non-nil values, but will sort non-nil values before nil values. */
export function compareCommon(
  aValue: CommonCompareType,
  bValue: CommonCompareType
): CompareResult {
  if (isNil(aValue) && !isNil(bValue)) return 1;
  if (!isNil(aValue) && isNil(bValue)) return -1;
  if (isNil(aValue) && isNil(bValue)) return 0;

  aValue = aValue as NonNullable<CommonCompareType>;
  bValue = bValue as NonNullable<CommonCompareType>;

  // narrow type to Dec, helps handle comparing unlike types
  if (typeof aValue === "number") aValue = new Dec(aValue);
  if (typeof bValue === "number") bValue = new Dec(bValue);
  if (aValue instanceof Int) aValue = new Dec(aValue);
  if (bValue instanceof Int) bValue = new Dec(bValue);
  if (typeof aValue === "object" && "toDec" in aValue) aValue = aValue.toDec();
  if (typeof bValue === "object" && "toDec" in bValue) bValue = bValue.toDec();

  if (aValue instanceof Dec && bValue instanceof Dec) {
    return compareDec(aValue, bValue);
  }

  if (aValue instanceof Date && bValue instanceof Date) {
    return compareDate(aValue, bValue);
  }

  return 0;
}

/** Compare Dec types. Useful with sort function. */
export function compareDec(a: Dec, b: Dec): CompareResult {
  if (a.lt(b)) return 1;
  if (a.gt(b)) return -1;
  return 0;
}

export function compareDate(a: Date, b: Date): CompareResult {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
}

/** Prefers an object that has a given member defined and non-null.
 *  **DOES NOT** compare the value. */
export function compareMemberDefinition<T extends object>(
  a: Partial<T>,
  b: Partial<T>,
  member: keyof T
): CompareResult {
  const aDefined = member in a && !isNil(a[member]);
  const bDefined = member in b && !isNil(b[member]);
  if (aDefined && !bDefined) return -1;
  if (!aDefined && bDefined) return 1;
  return 0;
}
