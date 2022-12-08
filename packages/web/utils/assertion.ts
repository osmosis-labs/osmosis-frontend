export function isFunction(value: any): value is Function {
  return typeof value === "function";
}

export function isNumeric(value: any) {
  return value != null && value - parseFloat(value) + 1 >= 0;
}
