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

/** Stand-in for a class from a duplicate `@osmosis-labs/unit` chunk. */
class ForeignPricePretty {
  constructor(
    public _fiatCurrency: typeof DEFAULT_VS_CURRENCY,
    public amount: Dec
  ) {}
  get fiatCurrency() {
    return this._fiatCurrency;
  }
  get options() {
    return {
      separator: "",
      upperCase: false,
      lowerCase: false,
      locale: this._fiatCurrency.locale,
    };
  }
  toDec() {
    return this.amount;
  }
}

class ForeignCoinPretty {
  constructor(public _currency: AppCurrency, public amount: Dec) {}
  get currency() {
    return this._currency;
  }
  get options() {
    return {
      separator: " ",
      upperCase: false,
      lowerCase: false,
      hideDenom: false,
    };
  }
  toCoin() {
    return { denom: this._currency.coinMinimalDenom, amount: "1000000" };
  }
  toDec() {
    return this.amount;
  }
}

class ForeignRatePretty {
  intPretty = {};
  _options = { separator: "", symbol: "%" };
  constructor(public amount: Dec) {}
  get options() {
    return this._options;
  }
  toDec() {
    return this.amount;
  }
}

class ForeignDec {
  int = "1500000000000000000";
  constructor(public value: string) {}
  truncate() {
    return { toString: () => this.value.split(".")[0] };
  }
  toString() {
    return this.value;
  }
}

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

  test("serializes a foreign PricePretty copy as PricePretty", () => {
    const foreign = new ForeignPricePretty(DEFAULT_VS_CURRENCY, new Dec("1.5"));
    expect(foreign instanceof PricePretty).toBe(false);

    const parsed = superjson.parse(superjson.stringify(foreign)) as PricePretty;
    expect(parsed).toBeInstanceOf(PricePretty);
    expect(parsed.toDec().toString()).toBe(new Dec("1.5").toString());
    expect(parsed.fiatCurrency.currency).toBe("usd");
  });

  test("serializes a foreign CoinPretty copy as CoinPretty", () => {
    const foreign = new ForeignCoinPretty(osmoCurrency, new Dec("1"));
    expect(foreign instanceof CoinPretty).toBe(false);

    const parsed = superjson.parse(superjson.stringify(foreign)) as CoinPretty;
    expect(parsed).toBeInstanceOf(CoinPretty);
    expect(parsed.currency.coinDenom).toBe("OSMO");
  });

  test("serializes a foreign RatePretty copy as RatePretty", () => {
    const foreign = new ForeignRatePretty(new Dec("0.05"));
    expect(foreign instanceof RatePretty).toBe(false);

    const parsed = superjson.parse(superjson.stringify(foreign)) as RatePretty;
    expect(parsed).toBeInstanceOf(RatePretty);
    expect(parsed.toDec().toString()).toBe(new Dec("0.05").toString());
  });

  test("serializes a foreign Dec copy as Dec", () => {
    const real = new Dec("1.5");
    const foreign = new ForeignDec(real.toString());
    expect(foreign instanceof Dec).toBe(false);

    const parsed = superjson.parse(superjson.stringify(foreign)) as Dec;
    expect(parsed).toBeInstanceOf(Dec);
    expect(parsed.toString()).toBe(real.toString());
  });
});
