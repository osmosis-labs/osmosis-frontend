import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";

export function normalize(
  val: number,
  max: number,
  min: number,
  a: number = 0,
  b: number = 1
) {
  return a + ((val - min) * (b - a)) / (max - min);
}

export function sum(arr: (number | string | Dec | { toDec(): Dec })[]): Dec {
  if (!arr || arr.length === 0) return new Dec(0);

  return arr.reduce<Dec>((acc, cur) => {
    if (typeof cur === "string") {
      return acc.add(new Dec(cur));
    }

    if (typeof cur === "number") {
      return acc.add(new Dec(cur));
    }

    if (cur instanceof Dec) {
      return acc.add(cur);
    }

    if (typeof cur === "object" && "toDec" in cur) {
      return acc.add(cur.toDec());
    }

    return acc;
  }, new Dec(0));
}

// mulPrice multiplies the amount of a coin by its price to get the final value.
// It returns the final value as a PricePretty object.
// Returns undefined if either the amount or price is undefined.
export function mulPrice(
  amount: CoinPretty | undefined,
  price: PricePretty | undefined,
  vsCurrency: FiatCurrency
) {
  if (!amount || !price) {
    return undefined;
  }

  const value = amount.toDec().mul(price.toDec());
  return new PricePretty(vsCurrency, value);
}
