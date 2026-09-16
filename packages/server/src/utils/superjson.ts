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
import SuperJSON from "superjson";

dayjs.extend(duration);

// One instance for tRPC + Redis. Re-exporting superjson's default singleton
// lets Turbopack rewrite `import { superjson } from "@osmosis-labs/server"`
// to the vanilla package, skipping registerCustom.
const superjson = new SuperJSON();

// tRPC SSG extracts `.serialize` (createServerSideHelpers.dehydrate),
// which drops `this` and crashes in classRegistry.getIdentifier.
// SuperJSON's static methods are already bound; instance methods are not.
superjson.serialize = superjson.serialize.bind(superjson);
superjson.deserialize = superjson.deserialize.bind(superjson);
superjson.stringify = superjson.stringify.bind(superjson);
superjson.parse = superjson.parse.bind(superjson);

// Turbopack inlines @osmosis-labs/unit per chunk, so `instanceof` against
// this file's Dec/PricePretty import fails for values constructed elsewhere
// (e.g. getMakerFee). Match the unique fields + methods instead.
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function hasFn(v: object, key: string): boolean {
  return typeof (v as Record<string, unknown>)[key] === "function";
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

// https://github.com/blitz-js/superjson

// This file allows us to directly pass complex types to and from tRPC methods from client <> server
// Add new types here as needed

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
      JSON.stringify({
        options: v.options,
        rate: v.toDec().toString(),
      }),
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

export { superjson };
