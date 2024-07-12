export function isFunction(value: any): value is Function {
  return typeof value === "function";
}

export function isNumeric(value: any) {
  return value != null && value - parseFloat(value) + 1 >= 0;
}

export function isValidNumericalRawInput(input: string) {
  if (!isNumeric(input)) return false;
  const num = Number(input);
  return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
}
