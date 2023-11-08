import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";

import { ObservableQueryExternalBase } from "../base";
import { MarketCap } from "./types";

/** Queries Imperator to get the market cap of the tokens. */
export class ObservableQueryMarketCaps extends ObservableQueryExternalBase<
  MarketCap[]
> {
  constructor(kvStore: KVStore, baseURL: string) {
    super(kvStore, baseURL, "/tokens/v2/mcap");

    makeObservable(this);
  }

  /**
   * Returns the market cap of all tokens.
   *
   * @returns It returns an array of results containing an object with the token symbol and its market cap in dollars.
   */
  @computed
  get marketCaps(): MarketCap[] {
    if (!this.response) return [];

    try {
      return this.response.data;
    } catch {
      return [];
    }
  }

  /**
   * Returns the market cap of a specific token
   *
   * @param symbol token symbol (ex. ATOM, OSMO, etc.)
   * @returns USD Market Cap or undefined, if symbol doesn't exist.
   */
  get(symbol: string) {
    if (!symbol) {
      console.warn("ObservableQueryMarketCaps: symbol is empty.");
    }
    return this.marketCaps?.find((marketCap) => marketCap.symbol === symbol)
      ?.market_cap;
  }
}
