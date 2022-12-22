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

/** TEMPORARY: use imperator query to fetch filtered, sorted pools */
export class ObservableQueryFilteredPools
  extends ObservableQueryExternalBase<FilteredPools>
  implements PoolGetter
{
  @observable
  protected _pools: Map<string, ObservableQueryPool> = new Map();

  protected _fetchingPoolIds: Set<string> = new Set();
  protected _queryParams: Filters & Pagination;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly queryNumPools: ObservableQueryNumPools,
    protected readonly baseUrl = IMPERATOR_HISTORICAL_DATA_BASEURL,
    protected readonly initialFilters: Filters = {
      min_liquidity: 10_000,
      order_key: "liquidity",
      order_by: "desc",
    },
    protected readonly initialPagination: Pagination = {
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

  protected setResponse(response: Readonly<QueryResponse<FilteredPools>>) {
    super.setResponse(response);

    // update potentially existing references of ObservableQueryPool objects
    for (const filteredPoolRaw of response.data.pools) {
      const existingQueryPool = this._pools.get(
        filteredPoolRaw.pool_id.toString()
      );
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
    }
  }

  /** Returns `undefined` if the pool does not exist or the data has not loaded. */
  readonly getPool: (id: string) => ObservableQueryPool | undefined =
    computedFn((id: string) => {
      if (!this.response && !this._pools.get(id)) {
        // if the data has not loaded, and the pool is not in the map, then fetch the individual pool

        return undefined;
      }

      if (
        this.response &&
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

  /** Gets all pools that have been fetched with current filter settings. */
  readonly getAllPools: () => ObservableQueryPool[] = computedFn(() => {
    if (!this.response) {
      return [];
    }

    return this.response.data.pools
      .map((raw) => {
        return this.getPool(raw.pool_id.toString());
      })
      .filter((pool): pool is ObservableQueryPool => pool !== undefined);
  });

  paginate() {
    this._queryParams.offset += this._queryParams.limit;
    this.updateUrlAndFetch();
  }

  fetchRemainingPools() {
    this.queryNumPools.waitResponse().then(() => {
      this._queryParams.offset += this._queryParams.limit;
      this._queryParams.limit = this.queryNumPools.numPools;
      this._queryParams.min_liquidity = 0;
      this.updateUrlAndFetch();
    });
  }

  protected updateUrlAndFetch() {
    this.setUrl(
      `${this.baseUrl}/pools/v2beta3/all?${objToQueryParams(this._queryParams)}`
    );
    this.waitFreshResponse();
  }
}
