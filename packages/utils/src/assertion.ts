export function isFunction(value: any): value is Function {
  return typeof value === "function";
}

export function isNumeric(value: any) {
  return value != null && value - parseFloat(value) + 1 >= 0;
}

export function isValidNumericalRawInput(input: string): boolean {
  // Normalize whitespace
  input = input.trim();

  // Allow empty (user hasn't started) and single dot (user started a decimal)
  if (input === "" || input === ".") return true;

  // Only digits with at most one decimal point, no signs, no exponents
  // Allows: "0", "10", "0.5", ".5" (handled above), "10.", "1.00"
  // Rejects: "-", "+", "1..2", "1.2.3", "1e3", "abc"
  const validPattern = /^\d*\.?\d*$/;
  if (!validPattern.test(input)) return false;

  // If it's just a dot we would have returned already, so reaching here means:
  // - string has at least one digit and optional single dot
  const num = Number(input);

  // Number("") would be 0 but we handled "", and Number(".") is NaN but we handled "."
  if (Number.isNaN(num)) return false;

  // Non-negative only
  if (num < 0) return false;

  // Optional cap: disallow values whose integer precision is unsafe.
  // If you really care about precision, consider checking integer part length instead.
  if (num > Number.MAX_SAFE_INTEGER) return false;

  return true;
}
