import { isNumeric } from "@osmosis-labs/utils";

export function getNumberMagnitude(val: string | number) {
  if (!isNumeric(val)) return 0;
  return Number(Number(val).toExponential().split("e")[1]);
}

export function getDecimalCount(val: string | number) {
  if (!isNumeric(val)) return 0;
  const valAsNumber = Number(val);

  if (valAsNumber.toString() === valAsNumber.toExponential()) {
    return Math.abs(Number(valAsNumber.toString().split("e")[1] || 0));
  }
  if (valAsNumber > Number.MAX_SAFE_INTEGER) {
    console.warn("getDecimalCount: value is too large to get count.");
    return 0;
  }

  if (Math.floor(valAsNumber) === valAsNumber) return 0;
  return valAsNumber.toString().split(".")[1].length || 0;
}

export function leadingZerosCount(val: string | number) {
  if (!isNumeric(val)) return 0;

  return (
    (typeof val === "number" ? val.toFixed(getDecimalCount(val)) : val)
      .split(".")[1]
      ?.match(/^0*/)?.[0].length ?? 0
  );
}

export function toScientificNotation(
  val: string | number,
  maxDecimals?: number
) {
  if (!isNumeric(val)) return "0";
  const numberAsExponential = Number(val).toExponential(maxDecimals);
  const magnitude = getNumberMagnitude(val);
  return magnitude === 0
    ? numberAsExponential.split("e")[0]
    : `${numberAsExponential.split("e")[0]}*10^${magnitude}`;
}

/** Trims 0s from end iff trailing integers from '.' are not all 0s. */
export function trimPlaceholderZeros(str: string) {
  const decimalPointIndex = str.indexOf(".");

  if (decimalPointIndex === -1) {
    // No decimal point in this string, so return original
    return str;
  }

  // Return if all chars after decimal point are 0
  let i = str.length - 1;
  while (i > decimalPointIndex && str.charAt(i) === "0") {
    i--;
  }

  // If we have only . left from the trimming, remove it as well
  if (str.charAt(i) === ".") {
    i--;
  }

  return str.substring(0, i + 1);
}

export function addCommasToNumber(number: string | number): string {
  if (!isNumeric(number)) return number as string;
  const parts = number.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export function removeCommasFromNumber(number: string): string {
  return number.replace(/,/g, "");
}

export function countDecimals(value: string) {
  const split = value.split(".");
  if (split.length > 1) {
    return split[1].length;
  }
  return 0;
}

/* Roundes a given number to the given precision
 * i.e. roundUpToDecimal(0.23456, 2) = 0.24
 */
export function roundUpToDecimal(value: number, precision: number) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.ceil(value * multiplier) / multiplier;
}

/**
 * Fixes a given string representation of a number to the given decimal count
 * Rounds to the decimal count if rounding is true
 */
export function fixDecimalCount(
  value: string,
  decimalCount = 18,
  rounding = false
) {
  if (rounding) {
    return roundUpToDecimal(parseFloat(value), decimalCount).toString();
  }
  const split = value.split(".");
  const integerPart = split[0];
  const fractionalPart = split[1] ? split[1].substring(0, decimalCount) : "";
  const result =
    integerPart + (decimalCount > 0 ? "." + fractionalPart : "");
  return result;
}

/**
 * Transforms a given amount to the given decimal count and handles period inputs
 * Rounds to the decimal count if rounding is true
 */
export function transformAmount(
  value: string,
  decimalCount = 18,
  rounding = false
) {
  let updatedValue = value;
  if (value.endsWith(".") && value.length === 1) {
    updatedValue = value + "0";
  }

  if (value.startsWith(".")) {
    updatedValue = "0" + value;
  }

  const decimals = countDecimals(updatedValue);
  return (
    decimals > decimalCount
      ? fixDecimalCount(updatedValue, decimalCount, rounding)
      : updatedValue
  ).trim();
}
