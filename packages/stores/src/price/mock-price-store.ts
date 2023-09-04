/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function */
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { IPriceStore } from "src/price";

export const MockFiatCurrencies: { [vsCurrency: string]: FiatCurrency } = {
  USD: {
    currency: "USD",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
  BTC: {
    currency: "Bitcoin",
    symbol: "₿",
    maxDecimals: 3,
    locale: "en-US",
  },
};

// PriceStoreMock allows the caller to provide a map of
// coin denom (or vsCurrency) to price in USD.
// PriceStoreMock only implements GetPrice for now.
export class PriceStoreMock implements IPriceStore {
  defaultVsCurrency: string;
  private prices: { [coinId: string]: number };

  constructor(prices: { [coinId: string]: number }) {
    this.defaultVsCurrency = "USD";
    this.prices = prices;
    this.prices[this.defaultVsCurrency] = 1;
  }

  calculatePrice(
    coin: CoinPretty,
    vsCurrency?: string
  ): PricePretty | undefined {
    if (!vsCurrency) {
      vsCurrency = this.defaultVsCurrency;
    }
    const price = this.getPrice(coin.denom, vsCurrency);
    if (!price) {
      return undefined;
    }
    const fiat = MockFiatCurrencies[vsCurrency];

    const priceDec = new Dec(price.toString());

    return new PricePretty(fiat, coin.toDec().mul(priceDec));
  }

  getPrice(coinId: string, vsCurrency?: string): number | undefined {
    if (!vsCurrency) {
      vsCurrency = this.defaultVsCurrency;
    }
    if (!this.prices[vsCurrency] || !this.prices[coinId]) {
      return undefined;
    }

    const coinPriceInUSD = this.prices[coinId];
    const vsCurrencyPriceInUSD = this.prices[vsCurrency];
    return coinPriceInUSD / vsCurrencyPriceInUSD;
  }

  getFiatCurrency(currency: string): FiatCurrency | undefined {
    return MockFiatCurrencies[currency];
  }

  setDefaultVsCurrency(defaultVsCurrency: string): void {
    this.defaultVsCurrency = defaultVsCurrency;
  }

  *restoreDefaultVsCurrency() {}
}
