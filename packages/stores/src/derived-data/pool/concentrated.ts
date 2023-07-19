import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";
import { computed, makeObservable } from "mobx";

import { AccountStore } from "../../account";
import { IPriceStore } from "../../price";
import { OsmosisQueries } from "../../queries/store";
import {
  ObservableQueryActiveGauges,
  ObservableQueryPoolFeesMetrics,
} from "../../queries-external";

/** Convenience store for getting common details of a share pool (balancer or stable) via many other lower-level query stores. */
export class ObservableConcentratedPoolDetail {
  protected readonly _fiatCurrency: FiatCurrency;

  constructor(
    readonly poolId: string,
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly accountStore: AccountStore,
    protected readonly priceStore: IPriceStore
  ) {
    const fiat = this.priceStore.getFiatCurrency(
      this.priceStore.defaultVsCurrency
    );

    if (!fiat)
      throw new Error("Could not find fiat currency from price store.");

    this._fiatCurrency = fiat;

    makeObservable(this);
  }

  @computed
  get queryConcentratedPool() {
    const pool = this.osmosisQueries.queryPools.getPool(this.poolId);

    if (Boolean(pool?.concentratedLiquidityPoolInfo)) return pool;
  }

  protected get bech32Address() {
    return this.accountStore.getWallet(this.osmosisChainId)?.address ?? "";
  }

  @computed
  protected get osmosisQueries() {
    const osmosisQueries = this.queriesStore.get(this.osmosisChainId).osmosis;
    if (!osmosisQueries) throw Error("Did not supply Osmosis chain ID");
    return osmosisQueries;
  }

  get isIncentivized() {
    return this.osmosisQueries.queryIncentivizedPools.isIncentivized(
      this.poolId
    );
  }

  @computed
  get totalValueLocked(): PricePretty {
    return (
      this.queryConcentratedPool?.computeTotalValueLocked(this.priceStore) ??
      new PricePretty(this._fiatCurrency, 0)
    );
  }

  @computed
  get swapFeeApr(): RatePretty {
    const queryPool = this.osmosisQueries.queryPools.getPool(this.poolId);
    if (!queryPool) return new RatePretty(0);

    return this.externalQueries.queryGammPoolFeeMetrics.get7dPoolFeeApr(
      queryPool,
      this.priceStore
    );
  }

  // TODO: figure out how we can integrate with concentrated pool here
  @computed
  get internalGauges() {
    return this.osmosisQueries.queryLockableDurations.lockableDurations
      .map((duration) => {
        const gaugeId =
          this.osmosisQueries.queryIncentivizedPools.getIncentivizedGaugeId(
            this.poolId,
            duration
          );

        const gauge = this.externalQueries.queryActiveGauges.get(
          gaugeId ?? "1"
        );

        const apr = this.osmosisQueries.queryIncentivizedPools.computeApr(
          this.poolId,
          duration,
          this.priceStore,
          this._fiatCurrency
        );

        return {
          id: gaugeId,
          duration,
          apr,
          isLoading: gauge?.isFetching ?? true,
        };
      })
      .filter(
        (
          gauge
        ): gauge is {
          id: string;
          duration: Duration;
          apr: RatePretty;
          isLoading: boolean;
        } => gauge !== undefined
      );
  }

  @computed
  get externalIncentives() {
    const gauges = this.osmosisQueries.queryPoolsGaugeIds.get(this.poolId);

    const coinDurationMap = new Map<
      string,
      { coinPerDay: CoinPretty; apr: RatePretty }
    >();
    gauges.gaugeIdsWithDuration?.forEach((gauge) => {
      const g = this.osmosisQueries.queryGauge.get(gauge.gaugeId);

      g.coins.forEach((coin) => {
        const existing = coinDurationMap.get(coin.remaining.denom);
        const add = coin.remaining
          .toDec()
          .mul(new Dec(1).sub(gauge.gaugeIncentivePercentage))
          .quo(new Dec(g.remainingEpoch));
        if (existing) {
          coinDurationMap.set(coin.remaining.denom, {
            ...existing,
            coinPerDay: existing.coinPerDay.add(add),
          });
        } else {
          console.log("rem", g.remainingEpoch);
          coinDurationMap.set(coin.remaining.denom, {
            coinPerDay: new CoinPretty(coin.remaining.currency, add),
            apr: this.osmosisQueries.queryIncentivizedPools.computeExternalIncentiveGaugeAPR(
              this.poolId,
              gauge.gaugeId,
              coin.remaining.denom,
              this.priceStore
            ),
          });
        }
      });
    });

    return Array.from(coinDurationMap.values());
  }

  @computed
  get userPositions() {
    return this.osmosisQueries.queryAccountsPositions
      .get(this.bech32Address)
      .positions.filter((position) => position.poolId === this.poolId);
  }

  @computed
  get userPoolAssets(): { asset: CoinPretty }[] {
    const queryPool = this.queryConcentratedPool;
    if (!queryPool) return [];

    // reduce to a summed map of coins by coin denom
    const coinSumsMap = this.userPositions.reduce<Map<string, CoinPretty>>(
      (coins, position) => {
        [position.baseAsset, position.quoteAsset]
          .filter((coin): coin is CoinPretty => Boolean(coin))
          .forEach((asset) => {
            const existingCoin = coins.get(asset.currency.coinMinimalDenom);
            if (existingCoin) {
              coins.set(
                asset.currency.coinMinimalDenom,
                existingCoin.add(asset)
              );
            } else {
              coins.set(asset.currency.coinMinimalDenom, asset);
            }
          });
        return coins;
      },
      new Map()
    );

    return Array.from(coinSumsMap.values()).map((asset) => ({ asset }));
  }

  @computed
  get userPoolValue(): PricePretty {
    const queryPool = this.queryConcentratedPool;
    if (!queryPool) return new PricePretty(this._fiatCurrency, 0);

    return this.userPoolAssets.reduce<PricePretty>((sum, { asset }) => {
      const value = this.priceStore.calculatePrice(asset);
      if (value) return sum.add(value);
      return sum;
    }, new PricePretty(this._fiatCurrency, 0));
  }
}

/** Stores a map of additional details for each share pool (balancer or stable) ID. */
export class ObservableConcentratedPoolDetails extends HasMapStore<ObservableConcentratedPoolDetail> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly accountStore: AccountStore,
    protected readonly priceStore: IPriceStore
  ) {
    super(
      (poolId: string) =>
        new ObservableConcentratedPoolDetail(
          poolId,
          this.osmosisChainId,
          this.queriesStore,
          this.externalQueries,
          this.accountStore,
          this.priceStore
        )
    );
  }

  get(poolId: string): ObservableConcentratedPoolDetail {
    return super.get(poolId);
  }
}
