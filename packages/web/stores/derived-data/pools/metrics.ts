import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import {
  ChainStore,
  IPriceStore,
  ObservableConcentratedPoolDetails,
  ObservablePoolsBonding,
  ObservableQueryActiveGauges,
  ObservableQueryPool,
  ObservableQueryPoolFeesMetrics,
  ObservableSharePoolDetails,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";

import { ObservableVerifiedPoolsStoreMap } from "~/stores/derived-data/pools/verified";
import { UnverifiedAssetsState, UserSettings } from "~/stores/user-settings";

export class ObservablePoolWithMetric {
  @observable
  queryPool: ObservableQueryPool;

  constructor(
    pool: ObservableQueryPool,
    protected readonly sharePoolDetails: ObservableSharePoolDetails,
    protected readonly concentratedPoolDetails: ObservableConcentratedPoolDetails,
    protected readonly poolsBonding: ObservablePoolsBonding,
    protected readonly chainStore: ChainStore,
    protected readonly externalQueries: {
      queryPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly priceStore: IPriceStore
  ) {
    this.queryPool = pool;
    makeObservable(this);
  }

  @action
  setPool(queryPool: ObservableQueryPool) {
    this.queryPool = queryPool;
  }

  get sharePoolDetail() {
    if (Boolean(this.queryPool.sharePool))
      return this.sharePoolDetails.get(this.queryPool.id);
  }

  get concentratedPoolDetail() {
    if (Boolean(this.queryPool.concentratedLiquidityPoolInfo))
      return this.concentratedPoolDetails.get(this.queryPool.id);
  }

  get liquidity() {
    return this.queryPool.computeTotalValueLocked(this.priceStore);
  }

  get myLiquidity() {
    return (
      this.sharePoolDetail?.userShareValue ??
      this.queryPool.computeTotalValueLocked(this.priceStore)
    );
  }

  get myAvailableLiquidity() {
    return (
      this.sharePoolDetail?.userAvailableValue ??
      new PricePretty(
        this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)!,
        0
      )
    );
  }

  get poolName() {
    return this.queryPool.poolAssets
      .map((asset) => asset.amount.currency.coinDenom)
      .join("/");
  }

  get networkNames() {
    return this.queryPool.poolAssets
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
        .get(this.queryPool.id)
        ?.highestBondDuration?.aggregateApr.maxDecimals(0) ??
      this.sharePoolDetail?.swapFeeApr.maxDecimals(0) ??
      new RatePretty("0")
    );
  }

  get feePoolMetrics() {
    return this.externalQueries.queryPoolFeeMetrics.getPoolFeesMetrics(
      this.queryPool.id,
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
  protected _verifiedPools = new Map<string, ObservablePoolWithMetric>();
  protected _allPools = new Map<string, ObservablePoolWithMetric>();

  constructor(
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly verifiedPoolsStore: ObservableVerifiedPoolsStoreMap,
    readonly chainId: string,
    protected readonly sharePoolDetails: ObservableSharePoolDetails,
    protected readonly concentratedPoolDetails: ObservableConcentratedPoolDetails,
    protected readonly poolsBonding: ObservablePoolsBonding,
    protected readonly chainStore: ChainStore,
    protected readonly externalQueries: {
      queryPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly priceStore: IPriceStore,
    protected readonly userSettings: UserSettings
  ) {}

  @computed
  get showUnverified() {
    return this.userSettings.getUserSettingById<UnverifiedAssetsState>(
      "unverified-assets"
    )?.state.showUnverifiedAssets;
  }

  readonly getAllPools = computedFn(
    (
      sortingColumn?: keyof ObservablePoolWithMetric,
      isSortingDesc?: boolean,
      forceShowUnverified?: boolean,
      concentratedLiquidityFeature?: boolean
    ) => {
      const showUnverified = this.showUnverified || forceShowUnverified;
      const allPools = this.verifiedPoolsStore
        .get(this.chainId)
        .getAllPools(showUnverified);

      const poolsMap = showUnverified ? this._allPools : this._verifiedPools;

      for (const pool of allPools ?? []) {
        const existingPool = poolsMap.get(pool.id);

        if (existingPool) {
          existingPool.setPool(pool);
        } else {
          poolsMap.set(
            pool.id,
            new ObservablePoolWithMetric(
              pool,
              this.sharePoolDetails,
              this.concentratedPoolDetails,
              this.poolsBonding,
              this.chainStore,
              this.externalQueries,
              this.priceStore
            )
          );
        }
      }

      const pools = Array.from(poolsMap.values()).filter((pool) => {
        // concentrated liquidity feature
        if (
          pool.queryPool.type === "concentrated" &&
          !concentratedLiquidityFeature
        ) {
          return false;
        }

        return true;
      });
      if (sortingColumn && isSortingDesc !== undefined) {
        // Clone the array to prevent the original array from being sorted, and triggering a re-render.
        const sortedPools = [...pools];
        return sortedPools.sort((a, b) => {
          let valueToCompareA: (typeof a)[keyof typeof a] | number =
            a[sortingColumn];
          let valueToCompareB: (typeof b)[keyof typeof b] | number =
            b[sortingColumn];

          // If user is sorting by pool, then sort by pool id
          if (sortingColumn === "queryPool") {
            valueToCompareA = Number(a.queryPool.id);
            valueToCompareB = Number(b.queryPool.id);
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

          if (
            (typeof valueToCompareA !== "number" || isNaN(valueToCompareA)) &&
            (typeof valueToCompareB !== "number" || isNaN(valueToCompareB))
          ) {
            return 0;
          }

          const aNum = valueToCompareA as number;
          const bNum = valueToCompareB as number;

          if (aNum > bNum) {
            return isSortingDesc ? -1 : 1;
          } else if (aNum < bNum) {
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
    protected readonly verifiedPoolsStore: ObservableVerifiedPoolsStoreMap,
    protected readonly sharePoolDetails: ObservableSharePoolDetails,
    protected readonly concentratedPoolDetails: ObservableConcentratedPoolDetails,
    protected readonly poolsBonding: ObservablePoolsBonding,
    protected readonly chainStore: ChainStore,
    protected readonly externalQueries: {
      queryPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly priceStore: IPriceStore,
    protected readonly userSettings: UserSettings
  ) {
    super(
      (chainId: string) =>
        new ObservablePoolsWithMetric(
          queriesStore,
          verifiedPoolsStore,
          chainId,
          sharePoolDetails,
          concentratedPoolDetails,
          poolsBonding,
          chainStore,
          externalQueries,
          priceStore,
          userSettings
        )
    );
  }

  get(chainId: string): ObservablePoolsWithMetric {
    return super.get(chainId);
  }
}
