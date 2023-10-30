import { KVStore } from "@keplr-wallet/common";
import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { computed, makeObservable } from "mobx";

import { IPriceStore } from "../../price";
import { IMPERATOR_TIMESERIES_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { TokenData } from "./types";

/** Queries Imperator token history data chart. */
export class ObservableQueryTokenData extends ObservableQueryExternalBase<
  TokenData[]
> {
  constructor(
    kvStore: KVStore,
    protected readonly priceStore: IPriceStore,
    baseURL: string,
    protected readonly denom: string
  ) {
    super(kvStore, baseURL, `/tokens/v2/${denom}`);

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return Boolean(this.denom);
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

  @computed
  get price() {
    const fiat = this.priceStore.getFiatCurrency(
      this.priceStore.defaultVsCurrency
    );

    if (!this?.response?.data[0]?.price || !fiat) return undefined;

    return new PricePretty(fiat, new Dec(this.response.data[0].price));
  }
}

export class ObservableQueryTokensData extends HasMapStore<ObservableQueryTokenData> {
  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    timeseriesDataBaseUrl = IMPERATOR_TIMESERIES_DEFAULT_BASEURL
  ) {
    super((symbol: string) => {
      return new ObservableQueryTokenData(
        kvStore,
        priceStore,
        timeseriesDataBaseUrl,
        symbol
      );
    });
  }

  get(symbol: string) {
    return super.get(symbol) as ObservableQueryTokenData;
  }
}
