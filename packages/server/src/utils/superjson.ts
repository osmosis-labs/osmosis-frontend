import { FiatCurrency } from "@keplr-wallet/types";
import { Currency } from "@osmosis-labs/types";
import {
  CoinPretty,
  CoinPrettyOptions,
  Dec,
  Int,
  PricePretty,
  PricePrettyOptions,
  RatePretty,
  RatePrettyOptions,
} from "@osmosis-labs/unit";
import dayjs from "dayjs";
import duration, { type Duration } from "dayjs/plugin/duration";
import superjson from "superjson";

dayjs.extend(duration);

// https://github.com/blitz-js/superjson

// This file allows us to directly pass complex types to and from tRPC methods from client <> server
// Add new types here as needed

/**
 * Turbopack inlines workspace packages into multiple chunks, so `instanceof`
 * against `@osmosis-labs/unit` classes fails. Values often reach superjson as
 * class-field dumps (`_fiatCurrency`, `amount`, `intPretty`) with no methods.
 * Match those shapes and revive them so client code can call `toDec()`.
 */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function hasFn(v: object, key: string): boolean {
  return typeof (v as Record<string, unknown>)[key] === "function";
}

function leakedDecToString(amount: unknown): string | undefined {
  if (typeof amount === "string" || typeof amount === "number") {
    return String(amount);
  }
  if (isRecord(amount) && typeof amount.int === "string") {
    return new Dec(amount.int).quo(new Dec("1000000000000000000")).toString();
  }
  return undefined;
}

function isDecValue(v: unknown): v is Dec {
  return (
    v instanceof Dec || (isRecord(v) && "int" in v && hasFn(v, "truncate"))
  );
}

function isIntValue(v: unknown): v is Int {
  return (
    v instanceof Int ||
    (isRecord(v) && "int" in v && hasFn(v, "toDec") && !("intPretty" in v))
  );
}

function isPricePrettyValue(v: unknown): v is PricePretty {
  return (
    v instanceof PricePretty ||
    (isRecord(v) && "_fiatCurrency" in v && hasFn(v, "toDec"))
  );
}

function isCoinPrettyValue(v: unknown): v is CoinPretty {
  return (
    v instanceof CoinPretty ||
    (isRecord(v) && "_currency" in v && hasFn(v, "toDec"))
  );
}

function isRatePrettyValue(v: unknown): v is RatePretty {
  return (
    v instanceof RatePretty ||
    (isRecord(v) &&
      "intPretty" in v &&
      !("_fiatCurrency" in v) &&
      !("_currency" in v) &&
      hasFn(v, "toDec"))
  );
}

function reviveLeakedUnitValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(reviveLeakedUnitValues);
  }
  if (!isRecord(value)) {
    return value;
  }
  if (
    value instanceof Dec ||
    value instanceof Int ||
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
    const amount = leakedDecToString(value.amount);
    if (amount == null) return value;
    return new CoinPretty(value._currency as unknown as Currency, amount);
  }
  if (isRecord(value._options) && "symbol" in value._options) {
    const amount = leakedDecToString(value.amount);
    if (amount == null) return value;
    return new RatePretty(amount);
  }

  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    out[key] = reviveLeakedUnitValues(nested);
  }
  return out;
}

superjson.registerCustom<Dec, string>(
  {
    isApplicable: isDecValue,
    serialize: (v) => v.toString(),
    deserialize: (v) => new Dec(v),
  },
  "Dec"
);

superjson.registerCustom<Int, string>(
  {
    isApplicable: isIntValue,
    serialize: (v) => v.toString(),
    deserialize: (v) => new Int(v),
  },
  "Int"
);

superjson.registerCustom<PricePretty, string>(
  {
    isApplicable: isPricePrettyValue,
    serialize: (v) =>
      JSON.stringify({
        fiat: v.fiatCurrency,
        options: v.options,
        amount: v.toDec().toString(),
      }),
    deserialize: (v) => {
      const { fiat, options, amount } = JSON.parse(v) as {
        fiat: FiatCurrency;
        options: PricePrettyOptions;
        amount: string;
      };
      let p = new PricePretty(fiat, new Dec(amount));
      if (options?.separator) p = p.separator(options.separator);
      if (options?.upperCase) p = p.upperCase(options.upperCase);
      if (options?.lowerCase) p = p.lowerCase(options.lowerCase);
      if (options?.locale) p = p.locale(options.locale);
      return p;
    },
  },
  "PricePretty"
);

superjson.registerCustom<CoinPretty, string>(
  {
    isApplicable: isCoinPrettyValue,
    serialize: (v) =>
      JSON.stringify({
        currency: v.currency,
        options: v.options,
        amount: v.toCoin().amount,
      }),
    deserialize: (v) => {
      const { currency, options, amount } = JSON.parse(v) as {
        currency: Currency;
        options: CoinPrettyOptions;
        amount: string;
      };
      let c = new CoinPretty(currency, amount);
      if (options?.separator) c = c.separator(options.separator);
      if (options?.upperCase) c = c.upperCase(options.upperCase);
      if (options?.lowerCase) c = c.lowerCase(options.lowerCase);
      if (options?.hideDenom) c = c.hideDenom(options.hideDenom);
      return c;
    },
  },
  "CoinPretty"
);

superjson.registerCustom<RatePretty, string>(
  {
    isApplicable: isRatePrettyValue,
    serialize: (v) =>
      JSON.stringify({ options: v.options, rate: v.toDec().toString() }),
    deserialize: (v) => {
      const { options, rate } = JSON.parse(v) as {
        options: RatePrettyOptions;
        rate: string;
      };
      let r = new RatePretty(rate);
      if (options?.separator) r = r.separator(options.separator);
      if (options?.symbol) r = r.symbol(options.symbol);
      return r;
    },
  },
  "RatePretty"
);

superjson.registerCustom<Duration, string>(
  {
    isApplicable: (v): v is Duration => dayjs.isDuration(v),
    serialize: (v) => v.asMilliseconds().toString(),
    deserialize: (v) => dayjs.duration(parseInt(v)),
  },
  "dayjs.Duration"
);

superjson.registerCustom<Buffer, string>(
  {
    isApplicable: (v): v is Buffer => Buffer.isBuffer(v),
    serialize: (v) => v.toString("base64"),
    deserialize: (v) => Buffer.from(v, "base64"),
  },
  "Buffer"
);

const originalParse = superjson.parse.bind(superjson);
const originalDeserialize = superjson.deserialize.bind(superjson);

superjson.parse = ((str: string) =>
  reviveLeakedUnitValues(originalParse(str))) as typeof superjson.parse;
superjson.deserialize = ((payload: Parameters<typeof originalDeserialize>[0]) =>
  reviveLeakedUnitValues(
    originalDeserialize(payload)
  )) as typeof superjson.deserialize;

export { superjson };
