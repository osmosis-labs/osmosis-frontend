import { KVStore } from "@keplr-wallet/common";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../../price";
import { ObservableQueryExternalBase } from "../base";
import { CoingeckoTokenMarket } from "./types";

/** Queries coingecko tokens info. */
export class ObservableQueryCoingeckoMarkets extends ObservableQueryExternalBase<
  CoingeckoTokenMarket[]
> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly priceStore: IPriceStore
  ) {
    super(
      kvStore,
      baseURL,
      `/v3/coins/markets?vs_currency=${
        priceStore.getFiatCurrency(priceStore.defaultVsCurrency)?.currency
      }`
    );
    makeObservable(this);
  }

  getMarket = computedFn((tokenSymbol: string) => {
    if (!this.response) return undefined;

    try {
      const market = this.response.data.find(
        ({ symbol }) => symbol.toLowerCase() === tokenSymbol.toLowerCase()
      );

      if (!market) {
        return undefined;
      }

      return market;
    } catch {
      return undefined;
    }
  });

  getMarketCap = computedFn((tokenSymbol: string) => {
    const fiat = this.priceStore.getFiatCurrency(
      this.priceStore.defaultVsCurrency
    );

    if (!fiat) return undefined;

    try {
      const market = this.getMarket(tokenSymbol);

      if (!market) return undefined;

      return new PricePretty(fiat, new Dec(market.market_cap));
    } catch {
      return undefined;
    }
  });
}
