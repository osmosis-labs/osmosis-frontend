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
