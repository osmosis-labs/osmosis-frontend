import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { PoolFallbackPriceStore } from "@osmosis-labs/stores";

// TODO: Change this out of the price pretty overhead, in a later iteration.
export function coinsToFiatValue(
  priceStore: PoolFallbackPriceStore,
  fiat: FiatCurrency,
  coins: CoinPretty[]
): number {
  return Number(
    coinsToFiatPricePretty(priceStore, fiat, coins).toDec().toString()
  );
}

// TODO: Do we actually want this anywhere?
export function coinsToFiatPricePretty(
  priceStore: PoolFallbackPriceStore,
  fiat: FiatCurrency,
  coins: CoinPretty[]
): PricePretty {
  return coins.reduce(
    (sum, asset) =>
      sum.add(priceStore.calculatePrice(asset) ?? new PricePretty(fiat, 0)),
    new PricePretty(fiat, 0)
  );
}

export function objCoinsToFiatPricePretty(
  priceStore: PoolFallbackPriceStore,
  fiat: FiatCurrency,
  coins: { asset: CoinPretty }[]
): PricePretty {
  let coinPrettyArr: CoinPretty[] = coins.map((obj) => obj.asset);
  return coinsToFiatPricePretty(priceStore, fiat, coinPrettyArr);
}
