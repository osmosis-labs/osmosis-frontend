import { AppCurrency } from "@keplr-wallet/types";
import {
  CoinPretty,
  Dec,
  Int,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";

import { DEFAULT_VS_CURRENCY } from "../../queries/complex/assets/config";
import { superjson } from "../superjson";

const osmoCurrency: AppCurrency = {
  coinDenom: "OSMO",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
};

describe("superjson unit transformers", () => {
  test("round-trips a real PricePretty", () => {
    const price = new PricePretty(DEFAULT_VS_CURRENCY, new Dec("1.23"));
    const parsed = superjson.parse(superjson.stringify(price)) as PricePretty;
    expect(parsed).toBeInstanceOf(PricePretty);
    expect(parsed.toDec().toString()).toBe(price.toDec().toString());
  });

  test("round-trips a real CoinPretty", () => {
    const coin = new CoinPretty(osmoCurrency, "1000000");
    const parsed = superjson.parse(superjson.stringify(coin)) as CoinPretty;
    expect(parsed).toBeInstanceOf(CoinPretty);
    expect(parsed.currency.coinDenom).toBe("OSMO");
  });

  test("round-trips a real RatePretty", () => {
    const parsed = superjson.parse(
      superjson.stringify(new RatePretty(new Dec("0.05")))
    ) as RatePretty;
    expect(parsed).toBeInstanceOf(RatePretty);
    expect(parsed.toDec().toString()).toBe(new Dec("0.05").toString());
  });

  test("round-trips a real Dec", () => {
    const parsed = superjson.parse(superjson.stringify(new Dec("1.5"))) as Dec;
    expect(parsed).toBeInstanceOf(Dec);
    expect(parsed.toString()).toBe(new Dec("1.5").toString());
  });

  test("round-trips a real Int", () => {
    const parsed = superjson.parse(superjson.stringify(new Int(42))) as Int;
    expect(parsed).toBeInstanceOf(Int);
    expect(parsed.toString()).toBe("42");
  });

  test("serialize stays bound when extracted, as tRPC SSG dehydrate does", () => {
    const { serialize, deserialize } = superjson;
    const parsed = deserialize(serialize(new Dec("1.5"))) as Dec;
    expect(parsed).toBeInstanceOf(Dec);
    expect(parsed.toString()).toBe(new Dec("1.5").toString());
  });
});
