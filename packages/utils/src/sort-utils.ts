export function compareDec(a: Dec, b: Dec): CompareResult {
  if (a.lt(b)) return 1;
  if (a.gt(b)) return -1;
  return 0;
}
