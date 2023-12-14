import { Dec, Int } from "@keplr-wallet/unit";

export type CommonCompareType = number | string | Dec | Int | { toDec(): Dec };
/** -1: a before b, 1: b before a, 0: do nothing. */
export type CompareResult = -1 | 1 | 0;

/** Compare common comparable types used in app. Useful with sort function. */
export function compareCommon(
  aValue: CommonCompareType,
  bValue: CommonCompareType
): CompareResult {
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

  return 0;
}

/** Compare Dec types. Useful with sort function. */
export function compareDec(a: Dec, b: Dec): CompareResult {
  if (a.lt(b)) return 1;
  if (a.gt(b)) return -1;
  return 0;
}

/** Compares whether an object has a given member defined.
 *  Prefers objects with the member defined. */
export function compareDefinedMember<T extends object>(
  a: T,
  b: T,
  member: string
): CompareResult {
  if (member in a && !(member in b)) return -1;
  if (!(member in a) && member in b) return 1;
  return 0;
}
