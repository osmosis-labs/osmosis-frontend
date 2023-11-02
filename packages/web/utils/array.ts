export function replaceAt<T>(
  what: T,
  where: Array<T>,
  index: number
): Array<T> {
  where.splice(index, 1, what);
  return [...where];
}

export function last<T>(arr: Array<T>): T {
  return arr[arr.length - 1];
}
