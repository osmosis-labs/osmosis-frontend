/** Object instance capable of processing memoized data via user input. */
export interface DataProcessor<TData> {
  process: (input: string) => TData;
}

const INFINITY = 1 / 0;
export function baseToString(value: any) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == "string") {
    return value;
  }
  let result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}

export function toString(value: any) {
  return value == null ? "" : baseToString(value);
}

export function isString(value: any) {
  return typeof value === "string";
}

export function isDefined(value: any) {
  return value !== undefined && value !== null;
}

export function isArray(value: any) {
  return !Array.isArray
    ? getTag(value) === "[object Array]"
    : Array.isArray(value);
}

function getTag(value: any) {
  return value == null
    ? value === undefined
      ? "[object Undefined]"
      : "[object Null]"
    : Object.prototype.toString.call(value);
}
