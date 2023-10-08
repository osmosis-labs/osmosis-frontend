import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { computed, makeObservable } from "mobx";

import { IMPERATOR_TIMESERIES_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";

type Response = {
  amount: number;
};

export class ObservableQueryCirculatingSupply extends ObservableQueryExternalBase<Response> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly denom: string
  ) {
    super(kvStore, baseURL, `/supply/v1/${denom}`);

    makeObservable(this);
  }

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
