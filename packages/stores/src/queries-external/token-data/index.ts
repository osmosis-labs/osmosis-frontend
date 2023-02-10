import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";

import { IMPERATOR_HISTORICAL_DATA_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { TokenData } from "./types";

/** Queries Imperator token history data chart. */
export class ObservableQueryTokenData extends ObservableQueryExternalBase<
  TokenData[]
> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly symbol: string
  ) {
    super(kvStore, baseURL, `/tokens/v2/${symbol}`);

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.symbol !== "" && this.symbol != null;
  }

  @computed
  get get24hrChange(): RatePretty | undefined {
    if (!this.response) return undefined;

    try {
      return new RatePretty(
        new Dec(this.response.data[0].price_24h_change / 100)
      );
    } catch {
      return undefined;
    }
  }
}

export class ObservableQueryTokensData extends HasMapStore<ObservableQueryTokenData> {
  constructor(
    kvStore: KVStore,
    tokenDataBaseUrl = IMPERATOR_HISTORICAL_DATA_BASEURL
  ) {
    super((symbol: string) => {
      return new ObservableQueryTokenData(kvStore, tokenDataBaseUrl, symbol);
    });
  }

  get(symbol: string) {
    return super.get(symbol) as ObservableQueryTokenData;
  }
}
