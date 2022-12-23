import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, QueryResponse } from "@keplr-wallet/stores";
import { makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { ObservableQueryNumPools } from "../../queries/pools";
import { ObservableQueryPool } from "../../queries/pools/pool";
import { PoolGetter } from "../../queries/pools/types";
import { IMPERATOR_HISTORICAL_DATA_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { Filters, objToQueryParams, Pagination, FilteredPools } from "./types";
import { makePoolRawFromFilteredPool } from "./utils";

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
  implements PoolGetter
{
  @observable
  protected _pools: Map<string, ObservableQueryPool> = new Map();

  protected _fetchingPoolIds: Set<string> = new Set();
  protected _queryParams: Filters & Pagination;

  @observable
  protected _canFetch = false;

  constructor(
    kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly queryNumPools: ObservableQueryNumPools,
    protected readonly baseUrl = IMPERATOR_HISTORICAL_DATA_BASEURL,
    initialFilters: Filters = {
      min_liquidity: 10_000,
      order_key: "liquidity",
      order_by: "desc",
    },
    initialPagination: Pagination = {
      offset: 0,
      limit: 160,
    }
  ) {
    super(
      kvStore,
      baseUrl,
      `/pools/v2beta3/all?${objToQueryParams({
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
      const existingQueryPool = this._pools.get(
        filteredPoolRaw.pool_id.toString()
      );
      try {
        const poolRaw = makePoolRawFromFilteredPool(filteredPoolRaw);
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
      } catch {}
    }
  }

  /** Returns `undefined` if the pool does not exist or the data has not loaded. */
  readonly getPool: (id: string) => ObservableQueryPool | undefined =
    computedFn((id: string) => {
      if (!this.response && this._canFetch && !this._pools.has(id)) {
        return undefined;
      }

      if (
        ((this.response && !this.isFetching) || !this._canFetch) &&
        !this._pools.has(id) &&
        !this._fetchingPoolIds.has(id)
      ) {
        this._fetchingPoolIds.add(id);
        ObservableQueryPool.makeWithoutRaw(
          id,
          this.kvStore,
          this.chainId,
          this.chainGetter
        )
          .then((pool) => runInAction(() => this._pools.set(id, pool)))
          .finally(() => this._fetchingPoolIds.delete(id));
      }

      return this._pools.get(id);
    });

  /** Returns `undefined` if pool data has not loaded, and `true`/`false` for if the pool exists. */
  readonly poolExists: (id: string) => boolean | undefined = computedFn(
    (id: string) => {
      if (this._pools.has(id)) return true;

      const r = this.response;
      if (r && !this.isFetching) {
        return r.data.pools.some((raw) => raw.pool_id.toString() === id);
      }
    },
    true
  );

  /** Gets all pools that have been fetched with current filter settings. Does not guarauntee any sort of order. */
  readonly getAllPools: () => ObservableQueryPool[] = computedFn(() => {
    runInAction(() => (this._canFetch = true));

    if (!this.response) {
      return [];
    }

    return Array.from(this._pools.values());
  });

  paginate() {
    this._queryParams.offset += this._queryParams.limit;
    this.updateUrlAndFetch();
  }

  fetchRemainingPools() {
    this.queryNumPools.waitResponse().then(() => {
      if (this._queryParams.limit !== this.queryNumPools.numPools) {
        this._queryParams.limit = this.queryNumPools.numPools;
        this._queryParams.min_liquidity = 0;
        this.updateUrlAndFetch();
      }
    });
  }

  protected updateUrlAndFetch() {
    this.setUrl(
      `${this.baseUrl}/pools/v2beta3/all?${objToQueryParams(this._queryParams)}`
    );
    return this.waitFreshResponse();
  }
}
