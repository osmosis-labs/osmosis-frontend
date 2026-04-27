import type { CoinPretty } from "@osmosis-labs/unit";

function normalizeDenom(value?: string) {
  return value?.toLowerCase().trim();
}

export function isSameCoinDenom(left: CoinPretty, right: CoinPretty): boolean {
  const leftDenoms = [
    normalizeDenom(left.currency.coinDenom),
    normalizeDenom(left.currency.coinMinimalDenom),
  ].filter((value): value is string => Boolean(value));
  const rightDenoms = [
    normalizeDenom(right.currency.coinDenom),
    normalizeDenom(right.currency.coinMinimalDenom),
  ].filter((value): value is string => Boolean(value));

  if (!leftDenoms.length || !rightDenoms.length) return false;

  return leftDenoms.some((denom) => rightDenoms.includes(denom));
}
