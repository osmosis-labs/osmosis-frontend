import { ObservableChainQuery } from "@keplr-wallet/stores/build/query/chain-query";
import { Pools } from "./types";
import { ChainGetter } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable, observable, runInAction } from "mobx";
import { ObservablePool } from "../pool";
import { ObservableQueryPoolsPagination } from "./page";

export class ObservableQueryPools extends ObservableChainQuery<Pools> {
  @observable.shallow
  protected map: Map<string, ObservableQueryPoolsPagination> = new Map();

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/osmosis/gamm/v1beta1/pools/all");

    makeObservable(this);
  }

  getPoolsPagenation(
    itemsPerPage: number,
    page: number
  ): ObservableQueryPoolsPagination {
    const key = `${itemsPerPage}/${page}`;

    if (!this.map.has(key)) {
      const query = new ObservableQueryPoolsPagination(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        itemsPerPage,
        page
      );

      runInAction(() => {
        this.map.set(key, query);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.map.get(key)!;
  }

  @computed
  get pools(): ObservablePool[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.pools.map(pool => {
      return new ObservablePool(this.chainId, this.chainGetter, pool);
    });
  }
}
