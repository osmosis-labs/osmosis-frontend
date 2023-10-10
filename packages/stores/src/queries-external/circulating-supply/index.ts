import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { computed, makeObservable } from "mobx";

import { IMPERATOR_TIMESERIES_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";

type Response = {
  amount: number;
};

/** Queries Imperator to obtain the circulating supply of a token, filtering by its denom. */
export class ObservableQueryCirculatingSupply extends ObservableQueryExternalBase<Response> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly denom: string
  ) {
    super(kvStore, baseURL, `/supply/v1/${denom}`);

    makeObservable(this);
  }

  /**
   * Returns the circulating supply of a token, which is an approximation of the number of coins
   * or tokens that are currently not locked and available for public transactions.
   *
   * @returns number | undefined
   */
  @computed
  get circulatingSupply(): number | undefined {
    try {
      if (!this.response || typeof this.response.data?.amount !== "number")
        return;

      const circulatingSupply = this.response.data.amount;
      if (isNaN(circulatingSupply)) return;
      return circulatingSupply;
    } catch {
      return undefined;
    }
  }
}

/**
 * We use a map as a data structure to cache the different results of "ObservableQueryCirculatingSupply"
 * and be able to retrieve them quickly by token denomination, from a single point.
 */
export class ObservableQueryCirculatingSupplies extends HasMapStore<ObservableQueryCirculatingSupply> {
  constructor(
    kvStore: KVStore,
    indexerBaseUrl = IMPERATOR_TIMESERIES_DEFAULT_BASEURL
  ) {
    super((denom) => {
      return new ObservableQueryCirculatingSupply(
        kvStore,
        indexerBaseUrl,
        denom
      );
    });
  }

  get(denom: string) {
    return super.get(denom) as ObservableQueryCirculatingSupply;
  }
}
