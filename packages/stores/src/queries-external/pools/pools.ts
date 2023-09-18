import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableQueryBalances,
  QueryResponse,
} from "@keplr-wallet/stores";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { ObservableQueryLiquiditiesNetInDirection } from "../../queries/concentrated-liquidity";
import { ObservableQueryNumPools } from "../../queries/pools";
import { ObservableQueryExternalBase } from "../base";
import { isSupportedPool, ObservableQueryPool } from "./pool";
import { ObservableQueryPoolGetter, Pools } from "./types";

/** Fetches all pools directly from edge function. */
export class ObservableQueryPools
  extends ObservableQueryExternalBase<Pools>
  implements ObservableQueryPoolGetter
{
  /** Maintain references of ObservableQueryPool objects to prevent breaking observers. */
  protected _pools: Map<string, ObservableQueryPool> = new Map<
    string,
    ObservableQueryPool
  >();

  protected _currentPagination: { page: number; limit: number };

  constructor(
    kvStore: KVStore,
    readonly chainId: string,
    readonly baseUrl: string,
    readonly chainGetter: ChainGetter,
    readonly queryLiquiditiesInNetDirection: ObservableQueryLiquiditiesNetInDirection,
    readonly queryBalances: ObservableQueryBalances,
    readonly queryNumPools: ObservableQueryNumPools,
    protected readonly poolIdBlacklist: string[] = [],
    protected readonly transmuterCodeIds: string[] = [],
    initialPagination = {
      page: 0,
      limit: 200,
    }
  ) {
    super(
      kvStore,
      baseUrl,
      ObservableQueryPools.makeUrl(0, initialPagination.limit)
    );

    this._currentPagination = initialPagination;

    makeObservable(this);
  }

  protected setResponse(response: Readonly<QueryResponse<Pools>>) {
    super.setResponse(response);

    // update potentially existing references of ObservableQueryPool objects
    for (const poolRaw of response.data.pools) {
      if (
        !isSupportedPool(poolRaw, this.poolIdBlacklist, this.transmuterCodeIds)
      )
        continue;

      const id = "pool_id" in poolRaw ? poolRaw.pool_id : poolRaw.id;
      const existingQueryPool = this._pools.get(id);
      if (existingQueryPool) {
        existingQueryPool.setRaw(poolRaw);
      } else {
        this._pools.set(
          id,
          new ObservableQueryPool(
            this.kvStore,
            this.chainId,
            this.baseUrl,
            this.chainGetter,
            this.queryLiquiditiesInNetDirection,
            this.queryBalances,
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
        return r.data.pools.some(
          (raw) => ("pool_id" in raw ? raw.pool_id : raw.id) === id
        );
      }
    },
    true
  );

  /** Gets all pools in the current pages. */
  readonly getAllPools = computedFn((): ObservableQueryPool[] => {
    if (!this.response) {
      return [];
    }

    return this.response.data.pools
      .filter((pool) => isSupportedPool(pool, this.poolIdBlacklist))
      .map((raw) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.getPool("pool_id" in raw ? raw.pool_id : raw.id)!;
      });
  });

  async paginate() {
    this.setUrl(
      ObservableQueryPools.makeUrl(
        this._currentPagination.page + 1,
        this._currentPagination.limit
      )
    );
    return this.waitResponse() as Promise<void>;
  }

  async fetchRemainingPools(limit?: number) {
    /** do nothing since all pools get fetched. */
    if (!limit) await this.queryNumPools.waitResponse();

    this.setUrl(
      ObservableQueryPools.makeUrl(0, limit ?? this.queryNumPools.numPools)
    );
    return this.waitResponse() as Promise<void>;
  }

  protected static makeUrl(page: number, limit: number) {
    return `/api/pools?page=${page}&limit=${limit}`;
  }
}
