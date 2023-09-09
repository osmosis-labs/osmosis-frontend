import { isNumeric } from "~/utils/assertion";

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
