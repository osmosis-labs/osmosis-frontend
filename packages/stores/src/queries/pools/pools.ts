import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableQueryBalances,
  QueryResponse,
} from "@keplr-wallet/stores";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { ObservableQueryLiquiditiesNetInDirection } from "../concentrated-liquidity";
import { ObservableQueryNodeInfo } from "../tendermint/node-info";
import { ObservableQueryNumPools } from "./num-pools";
import { isSupportedPool, ObservableQueryPool } from "./pool";
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
    readonly queryLiquiditiesInNetDirection: ObservableQueryLiquiditiesNetInDirection,
    readonly queryBalances: ObservableQueryBalances,
    readonly queryNodeInfo: ObservableQueryNodeInfo,
    readonly queryNumPools: ObservableQueryNumPools,
    protected readonly poolIdBlacklist: string[] = []
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/poolmanager/v1beta1/all-pools"
    );

    makeObservable(this);
  }

  protected setResponse(response: Readonly<QueryResponse<Pools>>) {
    super.setResponse(response);

    // update potentially existing references of ObservableQueryPool objects
    for (const poolRaw of response.data.pools) {
      if (!isSupportedPool(poolRaw, this.poolIdBlacklist)) continue;

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
            this.queryLiquiditiesInNetDirection,
            this.queryBalances,
            this.queryNodeInfo,
            poolRaw
          )
        );
      }
    }
  }

  /** Returns `undefined` if the pool does not exist or the data has not loaded. */
  getPool(id: string): ObservableQueryPool | undefined {
    if (this.poolIdBlacklist.includes(id)) return undefined;

    if (!this.response && !this._pools.get(id)) {
      return undefined;
    }
    return this._pools.get(id);
  }

  /** Returns `undefined` if pool data has not loaded, and `true`/`false` for if the pool exists. */
  readonly poolExists: (id: string) => boolean | undefined = computedFn(
    (id: string) => {
      if (this.poolIdBlacklist.includes(id)) return false;
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

    return this.response.data.pools
      .filter((pool) => isSupportedPool(pool, this.poolIdBlacklist))
      .map((raw) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.getPool(raw.id)!;
      });
  });

  /** TODO: implement pagination when we hit the limit of pools, for now, the url will be set to the max number of pools in the autorun above */
  async paginate() {
    /** do nothing */
  }

  async fetchRemainingPools() {
    /** do nothing since all pools get fetched. */
    return this.waitResponse() as Promise<void>;
  }
}
