import { AppCurrency, FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@osmosis-labs/unit";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasFn(value: object, key: string): boolean {
  return typeof (value as Record<string, unknown>)[key] === "function";
}

function leakedDecToString(amount: unknown): string | undefined {
  if (typeof amount === "string" || typeof amount === "number") {
    return String(amount);
  }
  if (isRecord(amount) && typeof amount.int === "string") {
    // `int` is Dec's 18-decimal internal representation.
    return new Dec(amount.int).quo(new Dec("1000000000000000000")).toString();
  }
  return undefined;
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
    const amount = leakedDecToString(value.amount);
    if (amount != null) {
      try {
        return new PricePretty(
          value._fiatCurrency as unknown as FiatCurrency,
          new Dec(amount)
        );
      } catch {
        // fall through and walk children
      }
    }
  }
  if (isRecord(value._currency) && "coinDenom" in value._currency) {
    const amount = leakedDecToString(value.amount);
    if (amount != null) {
      try {
        return new CoinPretty(
          value._currency as unknown as AppCurrency,
          amount
        );
      } catch {
        // fall through
      }
    }
  }
  if (isRecord(value._options) && "symbol" in value._options) {
    const amount = leakedDecToString(value.amount);
    if (amount != null) {
      try {
        return new RatePretty(amount);
      } catch {
        // fall through
      }
    }
  }

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    try {
      out[key] = reviveLeakedUnitValues(nested);
    } catch {
      out[key] = nested;
    }
  }
  return out;
}
