import {
  CoinPretty,
  Dec,
  Int,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";
import SuperJSON from "superjson";

import { superjson } from "../superjson";

const fiat = {
  currency: "usd",
  symbol: "$",
  maxDecimals: 2,
  locale: "en-US",
};
const currency = {
  coinDenom: "OSMO",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
};

// Simulate Next/OpenNext's bundled and external copies of the unit package.
let foreignUnit: typeof import("@osmosis-labs/unit");
jest.isolateModules(() => {
  foreignUnit = jest.requireActual("@osmosis-labs/unit");
});

type UnitConstructors = Pick<
  typeof import("@osmosis-labs/unit"),
  "CoinPretty" | "Dec" | "Int" | "PricePretty" | "RatePretty"
>;

function marketValues(unit: UnitConstructors) {
  return {
    currentPrice: new unit.PricePretty(fiat, "0.03423563438382369"),
    totalSupply: new unit.CoinPretty(currency, "791367419340511"),
    priceChange24h: new unit.RatePretty("-0.0365089213"),
    decimal: new unit.Dec("0.123456789123456789"),
    integer: new unit.Int("9007199254740993"),
  };
}

const annotations = {
  currentPrice: [["custom", "PricePretty"]],
  totalSupply: [["custom", "CoinPretty"]],
  priceChange24h: [["custom", "RatePretty"]],
  decimal: [["custom", "Dec"]],
  integer: [["custom", "Int"]],
};

function expectRoundTrip(values: ReturnType<typeof marketValues>) {
  // JSON transport is significant: plain-field dumps lose their prototypes.
  const payload = JSON.parse(JSON.stringify(superjson.serialize(values)));
  expect(payload.meta.values).toEqual(annotations);
  const restored = superjson.deserialize<typeof values>(payload);

  expect(restored.currentPrice).toBeInstanceOf(PricePretty);
  expect(restored.totalSupply).toBeInstanceOf(CoinPretty);
  expect(restored.priceChange24h).toBeInstanceOf(RatePretty);
  expect(restored.decimal).toBeInstanceOf(Dec);
  expect(restored.integer).toBeInstanceOf(Int);
  expect(restored.currentPrice.toDec().toString()).toBe(
    values.currentPrice.toDec().toString()
  );
  expect(restored.currentPrice.fiatCurrency).toEqual(fiat);
  expect(restored.totalSupply.toCoin()).toEqual(values.totalSupply.toCoin());
  expect(restored.priceChange24h.toDec().toString()).toBe(
    values.priceChange24h.toDec().toString()
  );
  expect(restored.decimal.toString()).toBe(values.decimal.toString());
  expect(restored.integer.toString()).toBe(values.integer.toString());
}

describe("unit SuperJSON transformers", () => {
  it("owns its registry instead of sharing the mutable package singleton", () => {
    expect(superjson).toBeInstanceOf(SuperJSON);
    expect(superjson.serialize).not.toBe(SuperJSON.serialize);
  });

  it("annotates and revives market values through JSON transport", () => {
    expectRoundTrip(
      marketValues({ CoinPretty, Dec, Int, PricePretty, RatePretty })
    );
  });

  it("recognizes values constructed by another bundled copy of unit", () => {
    const values = marketValues(foreignUnit);
    expect(values.currentPrice).not.toBeInstanceOf(PricePretty);
    expect(values.totalSupply).not.toBeInstanceOf(CoinPretty);
    expect(values.priceChange24h).not.toBeInstanceOf(RatePretty);
    expect(values.decimal).not.toBeInstanceOf(Dec);
    expect(values.integer).not.toBeInstanceOf(Int);
    expectRoundTrip(values);
  });

  it("retains its receiver when tRPC extracts transformer methods", () => {
    const { serialize, deserialize, stringify, parse } = superjson;
    const value = new PricePretty(fiat, "1.25");
    expect(deserialize<PricePretty>(serialize(value)).toDec().toString()).toBe(
      value.toDec().toString()
    );
    expect(parse<PricePretty>(stringify(value)).toDec().toString()).toBe(
      value.toDec().toString()
    );
  });

  it("does not guess unit types from method-less plain-field dumps", () => {
    const value = JSON.parse(JSON.stringify(marketValues(foreignUnit)));
    const payload = superjson.serialize(value);
    expect(JSON.stringify(payload.meta ?? {})).not.toContain("custom");
    expect(superjson.deserialize(payload)).toEqual(value);
  });

  it("preserves supported formatting options", () => {
    const price = new foreignUnit.PricePretty(fiat, "12.3")
      .separator(" ")
      .locale("de-DE");
    const coin = new foreignUnit.CoinPretty(currency, "1234567")
      .lowerCase(true)
      .hideDenom(true);
    const rate = new foreignUnit.RatePretty("0.25").symbol(" percent");
    const restored = superjson.parse<{
      price: PricePretty;
      coin: CoinPretty;
      rate: RatePretty;
    }>(superjson.stringify({ price, coin, rate }));
    expect(restored.price.options.separator).toBe(" ");
    expect(restored.price.options.locale).toBe("de-DE");
    expect(restored.coin.options.lowerCase).toBe(true);
    expect(restored.coin.options.hideDenom).toBe(true);
    expect(restored.rate.options.symbol).toBe(" percent");
  });
});
