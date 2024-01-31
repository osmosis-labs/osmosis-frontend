import { KVStore } from "@keplr-wallet/common";
import { RatePretty } from "@keplr-wallet/unit";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { computed, makeObservable } from "mobx";

import { NUMIA_INDEXER_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";

type Response = {
  APR: number;
};

/** Queries Imperator for extrapolated APR of a given position's tick range. */
export class ObservableQueryClPoolAvgApr extends ObservableQueryExternalBase<Response> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly poolId: string
  ) {
    super(kvStore, baseURL, `/cl/v1/apr/avg/${poolId}`);

    makeObservable(this);
  }

  @computed
  get apr(): RatePretty | undefined {
    try {
      if (!this.response || typeof this.response.data?.APR !== "number") return;

      const apr = this.response.data.APR / 100;
      if (isNaN(apr)) return;
      return new RatePretty(apr);
    } catch {
      return undefined;
    }
  }
}

export class ObservableQueryClPoolAvgAprs extends HasMapStore<ObservableQueryClPoolAvgApr> {
  constructor(kvStore: KVStore, indexerBaseUrl = NUMIA_INDEXER_BASEURL) {
    super((poolId) => {
      return new ObservableQueryClPoolAvgApr(kvStore, indexerBaseUrl, poolId);
    });
  }

  /** Defaults to min and max tick if not provided. */
  get(poolId: string) {
    return super.get(poolId) as ObservableQueryClPoolAvgApr;
  }
}
