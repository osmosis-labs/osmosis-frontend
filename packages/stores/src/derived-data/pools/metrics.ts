import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import { computed, makeObservable, observable } from "mobx";

import { ChainStore } from "../../chain";
import { IPriceStore } from "../../price";
import { ObservableQueryPool, OsmosisQueries } from "../../queries";
import {
  ObservableQueryActiveGauges,
  ObservableQueryPoolFeesMetrics,
} from "../../queries-external";
import { ObservablePoolsBonding } from "../pool/bonding";
import { ObservablePoolDetails } from "../pool/details";

class ObservablePoolWithMetric {
  constructor(
    readonly pool: ObservableQueryPool,
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

  @computed
  get poolDetail() {
    return this.poolDetails.get(this.pool.id);
  }

  @computed
  get liquidity() {
    return this.poolDetail.totalValueLocked;
  }

  @computed
  get myLiquidity() {
    return this.poolDetail.userShareValue;
  }

  @computed
  get myAvailableLiquidity() {
    return this.poolDetail.userAvailableValue;
  }

  @computed
  get poolName() {
    return this.pool.poolAssets
      .map((asset) => asset.amount.currency.coinDenom)
      .join("/");
  }

  @computed
  get networkNames() {
    return this.pool.poolAssets
      .map(
        (asset) =>
          this.chainStore.getChainFromCurrency(asset.amount.denom)?.chainName ??
          ""
      )
      .join(" ");
  }

  @computed
  get apr() {
    return (
      this.poolsBonding
        .get(this.pool.id)
        ?.highestBondDuration?.aggregateApr.maxDecimals(0) ??
      this.poolDetail.swapFeeApr.maxDecimals(0)
    );
  }

  @computed
  get feePoolMetrics() {
    return this.externalQueries.queryGammPoolFeeMetrics.getPoolFeesMetrics(
      this.pool.id,
      this.priceStore
    );
  }

  @computed
  get volume24h() {
    return this.feePoolMetrics.volume24h;
  }

  @computed
  get feesSpent7d() {
    return this.feePoolMetrics.feesSpent7d;
  }
}

/** Fetches all pools directly from node in order of pool creation. */
export class ObservablePoolsWithMetric {
  protected _pools = observable.array();

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

  @computed
  get allPools() {
    const allPools = this.queriesStore
      .get(this.chainId)
      .osmosis?.queryGammPools.getAllPools();

    const pools = allPools?.map(
      (pool) =>
        new ObservablePoolWithMetric(
          pool,
          this.poolDetails,
          this.poolsBonding,
          this.chainStore,
          this.externalQueries,
          this.priceStore
        )
    );

    return pools ?? [];
  }
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
