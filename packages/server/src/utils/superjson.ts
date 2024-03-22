import { FiatCurrency } from "@keplr-wallet/types";
import {
  CoinPretty,
  CoinPrettyOptions,
  Dec,
  Int,
  PricePretty,
  PricePrettyOptions,
  RatePretty,
  RatePrettyOptions,
} from "@keplr-wallet/unit";
import { Currency } from "@osmosis-labs/types";
import dayjs, { isDuration } from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import superjson from "superjson";

// https://github.com/blitz-js/superjson

// This file allows us to directly pass complex types to and from tRPC methods from client <> server
// Add new types here as needed

superjson.registerCustom<Dec, string>(
  {
    isApplicable: (v): v is Dec => v instanceof Dec,
    serialize: (v) => v.toString(),
    deserialize: (v) => new Dec(v),
  },
  "Dec"
);

superjson.registerCustom<Int, string>(
  {
    isApplicable: (v): v is Int => v instanceof Int,
    serialize: (v) => v.toString(),
    deserialize: (v) => new Int(v),
  },
  "Int"
);

superjson.registerCustom<PricePretty, string>(
  {
    isApplicable: (v): v is PricePretty => v instanceof PricePretty,
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
    isApplicable: (v): v is CoinPretty => v instanceof CoinPretty,
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
    isApplicable: (v): v is RatePretty => v instanceof RatePretty,
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
    isApplicable: (v): v is Duration => isDuration(v),
    serialize: (v) => v.asMilliseconds().toString(),
    deserialize: (v) => dayjs.duration(parseInt(v)),
  },
  "dayjs.Duration"
);

export { superjson };
