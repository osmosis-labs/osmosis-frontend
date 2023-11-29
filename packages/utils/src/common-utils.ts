/**
 * Checks if the input value is `null` or `undefined`.
 * @example
 *
 * isNil(null); //=> true
 * isNil(undefined); //=> true
 * isNil(0); //=> false
 * isNil([]); //=> false
 */
export function isNil(value: any): value is null | undefined {
  return value == null;
}
