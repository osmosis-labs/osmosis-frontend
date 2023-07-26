import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import {
  CoinPretty,
  Dec,
  DecUtils,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
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

  @computed
  get incentiveGauges() {
    /** In OSMO */
    const epochProvisions =
      this.osmosisQueries.queryEpochProvisions.epochProvisions;
    const epochPoolsProvisions = epochProvisions
      ? epochProvisions
          .toDec()
          .mul(DecUtils.getTenExponentN(epochProvisions.currency.coinDecimals))
          .mul(
            new Dec(0.2) // 20% goes to pools
          )
      : new Dec(0);
    const cfmmPoolLink =
      this.osmosisQueries.queryConcentratedLiquidityToCfmmPoolLinks.get(
        this.poolId
      ).cfmmPoolId;

    if (!cfmmPoolLink || !epochPoolsProvisions || !epochProvisions) return [];
    const linkedCfmmPool = this.osmosisQueries.queryPools.getPool(cfmmPoolLink);
    const activeTickLiq =
      this.queryConcentratedPool?.concentratedLiquidityPoolInfo
        ?.currentTickLiquidity;

    if (
      !linkedCfmmPool ||
      !activeTickLiq ||
      !linkedCfmmPool.weightedPoolInfo ||
      linkedCfmmPool.totalShare.toDec().isZero()
    )
      return [];

    const relativeLiq = activeTickLiq.quo(
      activeTickLiq.add(linkedCfmmPool.totalShare.toDec())
    );

    const internalGauges = this.osmosisQueries.queryPoolsGaugeIds.get(
      this.poolId
    );

    const coinDenomMap = new Map<
      string,
      { coinPerDay: CoinPretty; apr?: RatePretty }
    >();
    internalGauges.gaugeIdsWithDuration?.forEach((gauge) => {
      if (!gauge.gaugeIncentivePercentage.isZero()) {
        const dailyAssetPairDistrDaily = epochPoolsProvisions.mul(
          gauge.gaugeIncentivePercentage.quo(new Dec(100))
        );

        const clPoolDistrDaily = dailyAssetPairDistrDaily.mul(relativeLiq);

        coinDenomMap.set(epochProvisions.currency.coinMinimalDenom, {
          coinPerDay: new CoinPretty(
            epochProvisions.currency,
            clPoolDistrDaily
          ),
        });
      }
    });

    return Array.from(coinDenomMap.values());
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
