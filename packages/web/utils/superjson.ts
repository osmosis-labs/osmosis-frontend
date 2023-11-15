import { Dec, Int } from "@keplr-wallet/unit";
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

export { superjson };
