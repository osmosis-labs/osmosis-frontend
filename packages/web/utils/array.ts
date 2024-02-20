export function replaceAt<T>(
  what: T,
  where: Array<T>,
  index: number
): Array<T> {
  where.splice(index, 1, what);
  return [...where];
}

export function arrayOfLength<Value = undefined>(
  length: number,
  value?: Value
): Array<Value> {
  return Array.from({ length }, () => value as Value);
}
