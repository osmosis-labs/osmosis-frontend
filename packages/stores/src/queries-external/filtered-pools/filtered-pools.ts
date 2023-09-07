import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableQueryBalances,
  QueryResponse,
} from "@keplr-wallet/stores";
import { makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { ObservableQueryNodeInfo } from "src/queries/tendermint/node-info";

import { ObservableQueryLiquiditiesNetInDirection } from "../../queries";
import {
  ObservableQueryNumPools,
  ObservableQueryPool,
  ObservableQueryPoolGetter,
} from "../../queries/pools";
import { IMPERATOR_TIMESERIES_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { FilteredPools, Filters, objToQueryParams, Pagination } from "./types";
import { makePoolRawFromFilteredPool } from "./utils";

const ENDPOINT = "/stream/pool/v1/all";

/** TEMPORARY: use imperator query to fetch filtered, sorted pools.
 *
 *  Avoids fetching pools until necessary. Will fetch pools individually until all pools are requested,
 *    then it will fetch the top pools by liquidity until the remaining pools are explicitly requested.
 *
 *  TODO: This query includes token price and pool liquidity and volume data that is currently ignored.
 *        we could use that data to prevent other queries in the app, perhaps by adding some sort of
 *        store hydration mechanism to get this data into other query stores and preventing those stores from querying until needed.
 *        This could potentially grant additional performance improvements.
 */
export class ObservableQueryFilteredPools
  extends ObservableQueryExternalBase<FilteredPools>
  implements ObservableQueryPoolGetter
{
  @observable
  protected _pools = new Map<string, ObservableQueryPool>();

  @observable
  protected _nonExistentPoolsSet = new Set<string>();

  protected _fetchingPoolIds: Set<string> = new Set();
  protected _queryParams: Filters & Pagination;

  @observable
  protected _canFetch = false;

  constructor(
    kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly queryNumPools: ObservableQueryNumPools,
    readonly queryLiquiditiesInNetDirection: ObservableQueryLiquiditiesNetInDirection,
    readonly queryBalances: ObservableQueryBalances,
    readonly queryNodeInfo: ObservableQueryNodeInfo,
    protected readonly baseUrl = IMPERATOR_TIMESERIES_DEFAULT_BASEURL,
    protected readonly poolIdBlacklist: string[] = [],
    initialFilters: Filters = {
      min_liquidity: 1_000,
      order_key: "liquidity",
      order_by: "desc",
    },
    initialPagination: Pagination = {
      offset: 0,
      limit: 100,
    }
  ) {
    super(
      kvStore,
      baseUrl,
      `${ENDPOINT}?${objToQueryParams({
        ...initialFilters,
        ...initialPagination,
      })}`
    );

    this._queryParams = { ...initialFilters, ...initialPagination };

    makeObservable(this);
  }

  /** We'll only use the pools query if all pools are requested. */
  protected canFetch() {
    return this._canFetch;
  }

  protected setResponse(response: Readonly<QueryResponse<FilteredPools>>) {
    super.setResponse(response);

    // update potentially existing references of ObservableQueryPool objects
    for (const filteredPoolRaw of response.data.pools) {
      if (this.poolIdBlacklist.includes(filteredPoolRaw.pool_id.toString()))
        continue;

      const existingQueryPool = this._pools.get(
        filteredPoolRaw.pool_id.toString()
      );
      let poolRaw: ReturnType<typeof makePoolRawFromFilteredPool> | undefined;
      try {
        poolRaw = makePoolRawFromFilteredPool(filteredPoolRaw);
      } catch (e: any) {
        console.error(
          `Failed to make pool raw from filtered pool raw. ID: ${filteredPoolRaw.pool_id}, ${e.message}`
        );
      }

      if (!poolRaw) continue;

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
  readonly getPool: (id: string) => ObservableQueryPool | undefined =
    computedFn((id: string) => {
      if (this.poolIdBlacklist.includes(id)) return undefined;

      if (!this.response && this._canFetch && !this._pools.has(id)) {
        return undefined;
      }

      // if allPools() haven't been requested yet, fetch individual pools
      if (
        ((this.response && !this.isFetching) || !this._canFetch) &&
        !this._pools.has(id) &&
        !this._fetchingPoolIds.has(id) &&
        Boolean(id)
      ) {
        this._fetchingPoolIds.add(id);
        ObservableQueryPool.makeWithoutRaw(
          id,
          this.kvStore,
          this.chainId,
          this.chainGetter,
          this.queryLiquiditiesInNetDirection,
          this.queryBalances,
          this.queryNodeInfo
        )
          .then((pool) =>
            runInAction(() => {
              this._pools.set(id, pool);
            })
          )
          .catch((e: any) => {
            if (e.message === "not-found") {
              runInAction(() => this._nonExistentPoolsSet.add(id));
            }
          })
          .finally(() => this._fetchingPoolIds.delete(id));
      }

      return this._pools.get(id);
    });

  /** Returns `undefined` if pool data has not loaded, and `true`/`false` for if the pool exists. */
  readonly poolExists: (id: string) => boolean | undefined = computedFn(
    (id: string) => {
      if (this.poolIdBlacklist.includes(id)) return false;

      if (this._pools.has(id)) return true;
      else this.fetchRemainingPools();
      if (!Boolean(id) || this._nonExistentPoolsSet.has(id)) return false; // getPool was also used

      const r = this.response;
      if (r && !this.isFetching) {
        return r.data.pools.some((raw) => raw.pool_id.toString() === id);
      }
    },
    true
  );

  /** Gets all pools that have been fetched with current filter settings. Does not guarauntee any sort of order. */
  readonly getAllPools: () => ObservableQueryPool[] = computedFn(() => {
    // allow fetching all pools when all are requested
    let fetchNeeded = false;
    if (!this.canFetch() && !this.response) fetchNeeded = true;
    runInAction(() => (this._canFetch = true));
    if (fetchNeeded) {
      this.fetch();
    }

    if (!this.response) {
      return [];
    }

    return Array.from(this._pools.values());
  });

  async paginate() {
    if (this.isFetching) return;

    await this.queryNumPools.waitResponse();

    // if prev response yielded no pools,
    if (this.response && this.response.data.pools.length === 0) return;

    // if pools left to fetch
    if (
      this._queryParams.limit + this._queryParams.offset <
      this.queryNumPools.numPools
    ) {
      // increment offset and fetch with new offset in URL
      this._queryParams.offset += this._queryParams.limit;
      return this.setUrlToQueryParamsAndFetch() as Promise<void>;
    }

    return this.waitResponse() as Promise<void>;
  }

  async fetchRemainingPools() {
    runInAction(() => (this._canFetch = true));
    await this.queryNumPools.waitResponse();
    if (this._queryParams.limit !== this.queryNumPools.numPools) {
      // all pools regardless of liquidity
      this._queryParams.limit = this.queryNumPools.numPools;
      this._queryParams.min_liquidity = 0;
      return this.setUrlToQueryParamsAndFetch() as Promise<void>;
    }
    return this.waitResponse() as Promise<void>;
  }

  protected setUrlToQueryParamsAndFetch() {
    this.setUrl(
      `${this.baseUrl}${ENDPOINT}?${objToQueryParams(this._queryParams)}`
    );
    return this.waitResponse();
  }
}
