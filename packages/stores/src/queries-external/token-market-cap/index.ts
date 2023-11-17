import { KVStore } from "@keplr-wallet/common";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../../price";
import { ObservableQueryExternalBase } from "../base";
import { TokenMarketCap } from "./types";

/** Queries Imperator token history data chart. */
export class ObservableQueryMarketCap extends ObservableQueryExternalBase<
  TokenMarketCap[]
> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly priceStore: IPriceStore
  ) {
    super(kvStore, baseURL, `/tokens/v2/mcap`);
    makeObservable(this);
  }

  get = computedFn((denom: string) => {
    const fiat = this.priceStore.getFiatCurrency(
      this.priceStore.defaultVsCurrency
    );

    if (!this.response || !fiat) return undefined;

    try {
      const marketCap = this.response.data.find(
        ({ symbol }) => symbol.toLowerCase() === denom.toLowerCase()
      )?.market_cap;

      if (!marketCap) {
        return undefined;
      }

      return new PricePretty(fiat, new Dec(marketCap));
    } catch {
      return undefined;
    }
  });
}
