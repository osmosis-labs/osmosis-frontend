import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  QueryResponse,
} from "@keplr-wallet/stores";
import { autorun, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { GET_POOLS_PAGINATION_LIMIT } from ".";
import { ObservableQueryNumPools } from "./num-pools";
import { ObservableQueryPool } from "./pool";
import { ObservableQueryPoolGetter, Pools } from "./types";

/** Fetches all pools directly from node in order of pool creation. */
export class ObservableQueryPools
  extends ObservableChainQuery<Pools>
  implements ObservableQueryPoolGetter
{
  /** Maintain references of ObservableQueryPool objects to prevent breaking observers. */
  protected _pools: Map<string, ObservableQueryPool> = new Map<
    string,
    ObservableQueryPool
  >();

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    queryNumPools: ObservableQueryNumPools,
    limit = GET_POOLS_PAGINATION_LIMIT
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/gamm/v1beta1/pools?pagination.limit=${limit}`
    );

    makeObservable(this);

    autorun(() => {
      const numPools = queryNumPools.numPools;
      if (numPools > limit) {
        limit = numPools;
        this.setUrl(`/osmosis/gamm/v1beta1/pools?pagination.limit=${limit}`);
      }
    });
  }

  protected setResponse(response: Readonly<QueryResponse<Pools>>) {
    super.setResponse(response);

    // update potentially existing references of ObservableQueryPool objects
    for (const poolRaw of response.data.pools) {
      const existingQueryPool = this._pools.get(poolRaw.id);
      if (existingQueryPool) {
        existingQueryPool.setRaw(poolRaw);
      } else {
        this._pools.set(
          poolRaw.id,
          new ObservableQueryPool(
            this.kvStore,
            this.chainId,
            this.chainGetter,
            poolRaw
          )
        );
      }
    }
  }

  /** Returns `undefined` if the pool does not exist or the data has not loaded. */
  getPool(id: string): ObservableQueryPool | undefined {
    if (!this.response && !this._pools.get(id)) {
      return undefined;
    }

    return this._pools.get(id);
  }

  /** Returns `undefined` if pool data has not loaded, and `true`/`false` for if the pool exists. */
  readonly poolExists: (id: string) => boolean | undefined = computedFn(
    (id: string) => {
      // TODO: address pagination limit
      const r = this.response;
      if (r && !this.isFetching) {
        return r.data.pools.some((raw) => raw.id === id);
      }
    },
    true
  );

  readonly getAllPools = computedFn((): ObservableQueryPool[] => {
    if (!this.response) {
      return [];
    }

    return this.response.data.pools.map((raw) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.getPool(raw.id)!;
    });
  });

  /** TODO: implement pagination when we hit the limit of pools, for now, the url will be set to the max number of pools in the autorun above */
  paginate() {
    /** do nothing */
  }

  fetchRemainingPools() {
    /** do nothing since all pools get fetched. */
  }
}
