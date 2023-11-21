import { CoinPretty, Dec, Int, PricePretty } from "@keplr-wallet/unit";
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
      JSON.stringify({ fiat: v.fiatCurrency, amount: v.toDec().toString() }),
    deserialize: (v) => {
      const { fiat, amount } = JSON.parse(v);
      return new PricePretty(fiat, new Dec(amount));
    },
  },
  "PricePretty"
);

superjson.registerCustom<CoinPretty, string>(
  {
    isApplicable: (v): v is CoinPretty => v instanceof CoinPretty,
    serialize: (v) =>
      JSON.stringify({ currency: v.currency, amount: v.toCoin().amount }),
    deserialize: (v) => {
      const { currency, amount } = JSON.parse(v);
      return new CoinPretty(currency, amount);
    },
  },
  "CoinPretty"
);

export { superjson };
