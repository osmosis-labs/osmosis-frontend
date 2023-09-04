import { isNumeric } from "~/utils/assertion";

export function getNumberMagnitude(val: string | number) {
  if (!isNumeric(val)) return 0;
  return Number(Number(val).toExponential().split("e")[1]);
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
