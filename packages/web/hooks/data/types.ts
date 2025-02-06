/** Object instance capable of processing memoized data via user input. */
export interface DataProcessor<TData> {
  process: (input: string) => TData;
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
