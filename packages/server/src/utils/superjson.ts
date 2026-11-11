import { Currency } from "@osmosis-labs/types";
import {
  CoinPretty,
  CoinPrettyOptions,
  Dec,
  FiatCurrency,
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

// https://github.com/blitz-js/superjson

// Next/OpenNext can load both bundled and external copies of this module and
// @osmosis-labs/unit. The package's default singleton lets one copy overwrite
// another's custom predicates with different class identities. Own the registry
// and recognize live unit values across copies, without reviving plain objects.
const superjson = new SuperJSON();

// tRPC's SSG helpers extract these methods, so they must retain their receiver.
superjson.serialize = superjson.serialize.bind(superjson);
superjson.deserialize = superjson.deserialize.bind(superjson);
superjson.stringify = superjson.stringify.bind(superjson);
superjson.parse = superjson.parse.bind(superjson);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasMethod(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === "function";
}

superjson.registerCustom<Dec, string>(
  {
    isApplicable: (v): v is Dec =>
      v instanceof Dec ||
      (isRecord(v) &&
        typeof v.int === "bigint" &&
        hasMethod(v, "truncate") &&
        hasMethod(v, "toString")),
    serialize: (v) => v.toString(),
    deserialize: (v) => new Dec(v),
  },
  "Dec"
);

superjson.registerCustom<Int, string>(
  {
    isApplicable: (v): v is Int =>
      v instanceof Int ||
      (isRecord(v) &&
        typeof v.int === "bigint" &&
        hasMethod(v, "toDec") &&
        hasMethod(v, "toBigNumber") &&
        hasMethod(v, "toString")),
    serialize: (v) => v.toString(),
    deserialize: (v) => new Int(v),
  },
  "Int"
);

superjson.registerCustom<PricePretty, string>(
  {
    isApplicable: (v): v is PricePretty =>
      v instanceof PricePretty ||
      (isRecord(v) &&
        isRecord(v.fiatCurrency) &&
        typeof v.fiatCurrency.currency === "string" &&
        hasMethod(v, "toDec") &&
        hasMethod(v, "toString")),
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
    isApplicable: (v): v is CoinPretty =>
      v instanceof CoinPretty ||
      (isRecord(v) &&
        isRecord(v.currency) &&
        typeof v.currency.coinMinimalDenom === "string" &&
        hasMethod(v, "toCoin") &&
        hasMethod(v, "toDec") &&
        hasMethod(v, "toString")),
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
    isApplicable: (v): v is RatePretty =>
      v instanceof RatePretty ||
      (isRecord(v) &&
        isRecord(v.options) &&
        typeof v.options.symbol === "string" &&
        hasMethod(v, "symbol") &&
        hasMethod(v, "toDec") &&
        hasMethod(v, "toString")),
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

export { superjson };
