import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";

import { ObservableQueryExternalBase } from "../base";
import { MarketCap } from "./types";

/** Queries Imperator token history data chart. */
export class ObservableQueryMarketCaps extends ObservableQueryExternalBase<
  MarketCap[]
> {
  constructor(kvStore: KVStore, baseURL: string) {
    super(kvStore, baseURL, "/tokens/v2/mcap");

    makeObservable(this);
  }

  @computed
  get marketCaps(): MarketCap[] {
    if (!this.response) return [];

    try {
      return this.response.data;
    } catch {
      return [];
    }
  }

  get(symbol: string) {
    if (!symbol) {
      console.warn("ObservableQueryMarketCaps: symbol is empty.");
    }
    return this.marketCaps?.find((marketCap) => marketCap.symbol === symbol)
      ?.market_cap;
  }
}
