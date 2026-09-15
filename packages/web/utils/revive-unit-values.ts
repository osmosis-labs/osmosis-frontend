import { AppCurrency, FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@osmosis-labs/unit";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasFn(value: object, key: string): boolean {
  return typeof (value as Record<string, unknown>)[key] === "function";
}

function leakedDecToString(amount: unknown): string {
  if (typeof amount === "string" || typeof amount === "number") {
    return String(amount);
  }
  if (isRecord(amount) && typeof amount.int === "string") {
    return new Dec(amount.int, 0).toString();
  }
  throw new Error("Unknown leaked amount");
}

/**
 * Turbopack dumps `@osmosis-labs/unit` class instances as JSON field bags.
 * Rebuild PricePretty/CoinPretty/RatePretty so UI code can call `toDec()`.
 */
export function reviveLeakedUnitValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(reviveLeakedUnitValues);
  }
  if (!isRecord(value)) {
    return value;
  }
  if (
    value instanceof Dec ||
    value instanceof PricePretty ||
    value instanceof CoinPretty ||
    value instanceof RatePretty ||
    hasFn(value, "toDec") ||
    hasFn(value, "truncate")
  ) {
    return value;
  }
  if ("_fiatCurrency" in value && isRecord(value._fiatCurrency)) {
    return new PricePretty(
      value._fiatCurrency as unknown as FiatCurrency,
      new Dec(String(value.amount))
    );
  }
  if (isRecord(value._currency) && "coinDenom" in value._currency) {
    return new CoinPretty(
      value._currency as unknown as AppCurrency,
      leakedDecToString(value.amount)
    );
  }
  if (isRecord(value._options) && "symbol" in value._options) {
    return new RatePretty(leakedDecToString(value.amount));
  }

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    out[key] = reviveLeakedUnitValues(nested);
  }
  return out;
}
