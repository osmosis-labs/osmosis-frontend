import { isNumeric } from "./assertion";

export function toNumber(value: string | number): number {
  if (!isNumeric(value)) return 0;
  return Number(value);
}

export const roundNumber = (precision: number, value: number | string) => {
  if (!isNumeric(value)) return 0;
  const numberToRound = Number(value);
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(numberToRound * multiplier) / multiplier;
};

export function addCommasToNumber(number: string | number): string {
  if (!isNumeric(number)) return number as string;
  const parts = number.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

const ThousandDivisor = Math.pow(10, 3);
const MillionDivisor = Math.pow(10, 6);
const BillionDivisor = Math.pow(10, 9);

export const convertNumberToScale = (value: number | string) => {
  const valueAsNumber = toNumber(value);

  if (valueAsNumber >= BillionDivisor) {
    return roundNumber(1, valueAsNumber / BillionDivisor);
  } else if (valueAsNumber >= MillionDivisor) {
    return roundNumber(1, valueAsNumber / MillionDivisor);
  } else if (valueAsNumber >= ThousandDivisor) {
    return roundNumber(1, valueAsNumber / ThousandDivisor);
  }

  return roundNumber(1, valueAsNumber) || 0;
};

export const getClosestScale = (value: number | string) => {
  const valueAsNumber = toNumber(value);

  if (valueAsNumber >= BillionDivisor) {
    return "B";
  } else if (value >= MillionDivisor) {
    return "M";
  } else if (value >= ThousandDivisor) {
    return "K";
  }
  return "";
};

export const formatNumberToScale = (value: number | string) => {
  const closestScale = getClosestScale(value);
  const closestScaleValue = convertNumberToScale(value);
  return `${addCommasToNumber(closestScaleValue)}${closestScale}`;
};
