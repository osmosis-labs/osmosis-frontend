import { ObservableQueryPools } from "./pools";
import { ChainGetter, HasMapStore } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";

export class OsmosisQueries {
  protected readonly _queryPools: ObservableQueryPools;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    this._queryPools = new ObservableQueryPools(kvStore, chainId, chainGetter);
  }

  getQueryPools(): DeepReadonly<ObservableQueryPools> {
    return this._queryPools;
  }
}

export class OsmosisQueriesStore extends HasMapStore<
  DeepReadonly<OsmosisQueries>
> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter
  ) {
    super((chainId: string) => {
      return new OsmosisQueries(this.kvStore, chainId, this.chainGetter);
    });
  }

  get(chainId: string): DeepReadonly<OsmosisQueries> {
    return super.get(chainId);
  }
}
