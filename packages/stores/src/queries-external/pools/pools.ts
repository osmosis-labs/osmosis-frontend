import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableQueryBalances,
  QueryResponse,
} from "@osmosis-labs/keplr-stores";
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

  protected _queryParams: {
    minLiquidity: number;
    page: number;
    limit: number;
  };

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
    protected readonly astroportPclCodeIds: string[] = [],
    pagination = {
      page: 1,
      limit: 300,
    }
  ) {
    super(
      kvStore,
      baseUrl,
      ObservableQueryPools.makeUrl({
        page: pagination.page,
        limit: pagination.limit,
        minLiquidity: 1_000,
      })
    );

    this._queryParams = { minLiquidity: 1_000, ...pagination };

    makeObservable(this);
  }

  protected setResponse(response: Readonly<QueryResponse<Pools>>) {
    super.setResponse(response);

    // update potentially existing references of ObservableQueryPool objects
    for (const poolRaw of response.data.pools) {
      if (
        !isSupportedPool(
          poolRaw,
          this.poolIdBlacklist,
          this.transmuterCodeIds,
          this.astroportPclCodeIds
        )
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
  readonly getPool = computedFn(
    (id: string): ObservableQueryPool | undefined => {
      if (this.poolIdBlacklist.includes(id)) return undefined;
      if (!this.response && !this._pools.get(id)) return undefined;

      return this._pools.get(id);
    }
  );

  /** Returns `undefined` if pool data has not loaded, and `true`/`false` for if the pool exists. */
  readonly poolExists = computedFn((id: string): boolean | undefined => {
    if (this.poolIdBlacklist.includes(id)) return false;

    const response = this.response;

    if (!response || this.isFetching) return;

    const found = response.data.pools.some(
      (raw) => ("pool_id" in raw ? raw.pool_id : raw.id) === id
    );
    if (found) return true;

    /**
     * If the current page has a next page, then there are more pools that have not been fetched.
     * Fetch next page.
     */
    if (response.data.pageInfo?.hasNextPage) {
      this.paginate();
      return;
    }

    /**
     * If the total number of pools is greater than the number of pools fetched,
     * then there are more pools that have not been fetched. Fetch all remaining pools.
     */
    if (Number(response.data.totalNumberOfPools) > this._queryParams.limit) {
      this.fetchRemainingPools({
        limit: Number(response.data.totalNumberOfPools),
        minLiquidity: 0,
      });
      return;
    }

    return false;
  }, true);

  /** Gets all pools in the current pages. */
  readonly getAllPools = computedFn((): ObservableQueryPool[] => {
    if (!this.response) {
      return [];
    }

    return this.response.data.pools
      .filter((pool) =>
        isSupportedPool(
          pool,
          this.poolIdBlacklist,
          this.transmuterCodeIds,
          this.astroportPclCodeIds
        )
      )
      .map((raw) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.getPool("pool_id" in raw ? raw.pool_id : raw.id)!;
      });
  });

  async paginate() {
    await this.queryNumPools.waitResponse();

    // if prev response yielded no pools,
    if (this.response && this.response.data.pools.length === 0) return;

    if (
      this._queryParams.page * this._queryParams.limit >=
        this.queryNumPools.numPools ||
      this.isFetching
    )
      return this.waitResponse() as Promise<void>;

    this._queryParams.page++;
    return this.setUrlAndFetch({
      page: this._queryParams.page,
      limit: this._queryParams.limit,
      minLiquidity: this._queryParams.minLiquidity,
    });
  }

  async fetchRemainingPools({
    limit,
    minLiquidity,
  }: {
    limit?: number;
    minLiquidity?: number;
  } = {}) {
    if (this.isFetching) return this.waitResponse() as Promise<void>;

    if (!limit) await this.queryNumPools.waitResponse();

    return this.setUrlAndFetch({
      page: 1,
      limit: limit ?? this.queryNumPools.numPools,
      minLiquidity: minLiquidity ?? this._queryParams.minLiquidity,
    });
  }

  protected setUrlAndFetch(params: {
    page: number;
    limit: number;
    minLiquidity: number;
  }) {
    if (ObservableQueryPools.makeUrl(params) === this.url)
      return this.waitResponse() as Promise<void>;

    this._queryParams = params;

    this.setUrl(ObservableQueryPools.makeUrl(params));

    // Await current fetch if fetching, otherwise force fetch
    if (this.isFetching) return this.waitResponse() as Promise<void>;
    return this.waitFreshResponse() as Promise<void>;
  }

  protected static makeUrl({
    page,
    limit,
    minLiquidity,
  }: {
    page: number;
    limit: number;
    minLiquidity?: number;
  }) {
    return `/api/pools?page=${page}&limit=${limit}&min_liquidity=${minLiquidity}`;
  }
}
