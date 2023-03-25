import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import { action, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";

import { ChainStore } from "../../chain";
import { IPriceStore } from "../../price";
import { ObservableQueryPool, OsmosisQueries } from "../../queries";
import {
  ObservableQueryActiveGauges,
  ObservableQueryPoolFeesMetrics,
} from "../../queries-external";
import { ObservablePoolsBonding } from "../pool/bonding";
import { ObservablePoolDetails } from "../pool/details";

export class ObservablePoolWithMetric {
  @observable
  pool: ObservableQueryPool;

  constructor(
    pool: ObservableQueryPool,
    protected readonly poolDetails: ObservablePoolDetails,
    protected readonly poolsBonding: ObservablePoolsBonding,
    protected readonly chainStore: ChainStore,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly priceStore: IPriceStore
  ) {
    this.pool = pool;
    makeObservable(this);
  }

  @action
  setPool(pool: ObservableQueryPool) {
    this.pool = pool;
  }

  get poolDetail() {
    return this.poolDetails.get(this.pool.id);
  }

  get liquidity() {
    return this.poolDetail.totalValueLocked;
  }

  get myLiquidity() {
    return this.poolDetail.userShareValue;
  }

  get myAvailableLiquidity() {
    return this.poolDetail.userAvailableValue;
  }

  get poolName() {
    return this.pool.poolAssets
      .map((asset) => asset.amount.currency.coinDenom)
      .join("/");
  }

  get networkNames() {
    return this.pool.poolAssets
      .map(
        (asset) =>
          this.chainStore.getChainFromCurrency(asset.amount.denom)?.chainName ??
          ""
      )
      .join(" ");
  }

  get apr() {
    return (
      this.poolsBonding
        .get(this.pool.id)
        ?.highestBondDuration?.aggregateApr.maxDecimals(0) ??
      this.poolDetail.swapFeeApr.maxDecimals(0)
    );
  }

  get feePoolMetrics() {
    return this.externalQueries.queryGammPoolFeeMetrics.getPoolFeesMetrics(
      this.pool.id,
      this.priceStore
    );
  }

  get volume24h() {
    return this.feePoolMetrics.volume24h;
  }

  get feesSpent7d() {
    return this.feePoolMetrics.feesSpent7d;
  }
}

/** Fetches all pools directly from node in order of pool creation. */
export class ObservablePoolsWithMetric {
  @observable
  protected _pools = new Map<string, ObservablePoolWithMetric>();

  constructor(
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    readonly chainId: string,
    protected readonly poolDetails: ObservablePoolDetails,
    protected readonly poolsBonding: ObservablePoolsBonding,
    protected readonly chainStore: ChainStore,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly priceStore: IPriceStore
  ) {
    makeObservable(this);
  }

  getAllPools = computedFn(
    (
      sortingColumn?: keyof ObservablePoolWithMetric,
      isSortingDesc?: boolean
    ) => {
      const allPools = this.queriesStore
        .get(this.chainId)
        .osmosis?.queryGammPools.getAllPools();

      for (const pool of allPools ?? []) {
        const existingPool = this._pools.get(pool.id);

        if (existingPool) {
          existingPool.setPool(pool);
        } else {
          runInAction(() => {
            this._pools.set(
              pool.id,
              new ObservablePoolWithMetric(
                pool,
                this.poolDetails,
                this.poolsBonding,
                this.chainStore,
                this.externalQueries,
                this.priceStore
              )
            );
          });
        }
      }

      const pools = Array.from(this._pools.values());
      if (sortingColumn && isSortingDesc !== undefined) {
        // Clone the array to prevent the original array from being sorted, and triggering a re-render.
        const sortedPools = [...pools];
        return sortedPools.sort((a, b) => {
          let valueToCompareA: typeof a[keyof typeof a] | number =
            a[sortingColumn];
          let valueToCompareB: typeof b[keyof typeof b] | number =
            b[sortingColumn];

          // If user is sorting by pool, then sort by pool id
          if (sortingColumn === "pool") {
            valueToCompareA = Number(a.pool.id);
            valueToCompareB = Number(b.pool.id);
          }

          if (
            valueToCompareA instanceof PricePretty ||
            valueToCompareA instanceof RatePretty
          ) {
            valueToCompareA = Number(valueToCompareA.toDec().toString());
          }

          if (
            valueToCompareB instanceof PricePretty ||
            valueToCompareB instanceof RatePretty
          ) {
            valueToCompareB = Number(valueToCompareB.toDec().toString());
          }

          if (valueToCompareA > valueToCompareB) {
            return isSortingDesc ? -1 : 1;
          } else if (valueToCompareA < valueToCompareB) {
            return isSortingDesc ? 1 : -1;
          } else {
            return 0;
          }
        });
      }

      return pools;
    }
  );
}

export class ObservablePoolsWithMetrics extends HasMapStore<ObservablePoolsWithMetric> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly poolDetails: ObservablePoolDetails,
    protected readonly poolsBonding: ObservablePoolsBonding,
    protected readonly chainStore: ChainStore,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly priceStore: IPriceStore
  ) {
    super(
      (chainId: string) =>
        new ObservablePoolsWithMetric(
          queriesStore,
          chainId,
          poolDetails,
          poolsBonding,
          chainStore,
          externalQueries,
          priceStore
        )
    );
  }

  get(chainId: string): ObservablePoolsWithMetric {
    return super.get(chainId);
  }
}
