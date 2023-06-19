import {
  HasMapStore,
  IAccountStore,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { computed, makeObservable } from "mobx";

import { IPriceStore } from "../../price";
import { OsmosisQueries } from "../../queries/store";
import {
  ObservableQueryActiveGauges,
  ObservableQueryPoolFeesMetrics,
} from "../../queries-external";
import { ExternalSharesGauge } from "./types";

/** Convenience store for getting common details of a share pool (balancer or stable) via many other lower-level query stores. */
export class ObservableSharePoolDetail {
  protected readonly _fiatCurrency: FiatCurrency;

  constructor(
    protected readonly poolId: string,
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly accountStore: IAccountStore,
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
  get querySharePool() {
    const pool = this.osmosisQueries.queryPools.getPool(this.poolId);

    if (Boolean(pool?.sharePool)) return pool;
  }

  protected get bech32Address() {
    return this.accountStore.getAccount(this.osmosisChainId).bech32Address;
  }

  @computed
  protected get osmosisQueries() {
    const osmosisQueries = this.queriesStore.get(this.osmosisChainId).osmosis;
    if (!osmosisQueries) throw Error("Did not supply Osmosis chain ID");
    return osmosisQueries;
  }

  get poolShareCurrency() {
    return this.osmosisQueries.queryGammPoolShare.makeShareCurrency(
      this.poolId
    );
  }

  get isIncentivized() {
    return this.osmosisQueries.queryIncentivizedPools.isIncentivized(
      this.poolId
    );
  }

  @computed
  get totalValueLocked(): PricePretty {
    return (
      this.querySharePool?.computeTotalValueLocked(this.priceStore) ??
      new PricePretty(this._fiatCurrency, 0)
    );
  }

  get lockableDurations(): Duration[] {
    return this.osmosisQueries.queryLockableDurations.lockableDurations;
  }

  get longestDuration(): Duration | undefined {
    return this.lockableDurations[this.lockableDurations.length - 1];
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

  get userShareValue(): PricePretty {
    return this.totalValueLocked.mul(
      this.osmosisQueries.queryGammPoolShare.getAllGammShareRatio(
        this.bech32Address,
        this.poolId
      )
    );
  }

  get userBondedValue(): PricePretty {
    return this.osmosisQueries.queryGammPoolShare.getLockedGammShareValue(
      this.bech32Address,
      this.poolId,
      this.totalValueLocked,
      this._fiatCurrency
    );
  }

  @computed
  get userBondedShares(): CoinPretty {
    return this.queries.queryGammPoolShare.getLockedGammShare(
      this.bech32Address,
      this.poolId
    );
  }

  @computed
  get userAvailableValue(): PricePretty {
    const queryPool = this.querySharePool;

    return queryPool &&
      queryPool.totalShare &&
      !queryPool.totalShare.toDec().equals(new Dec(0))
      ? this.totalValueLocked.mul(
          this.osmosisQueries.queryGammPoolShare
            .getAvailableGammShare(this.bech32Address, this.poolId)
            .quo(queryPool.totalShare)
        )
      : new PricePretty(this._fiatCurrency, new Dec(0));
  }

  get userAvailableShares(): CoinPretty {
    return this.osmosisQueries.queryGammPoolShare.getAvailableGammShare(
      this.bech32Address,
      this.poolId
    );
  }

  @computed
  get userPoolAssets() {
    const queryPool = this.querySharePool;
    if (!queryPool) return [];

    return (
      queryPool.poolAssets.map((asset) => {
        const weightedAsset = queryPool.weightedPoolInfo?.assets.find(
          ({ denom }) => denom === asset.amount.currency.coinMinimalDenom
        );
        const totalWeight = queryPool.weightedPoolInfo?.totalWeight;

        return {
          ratio:
            weightedAsset && totalWeight
              ? new RatePretty(weightedAsset.weight.quo(totalWeight))
              : new RatePretty(0),
          asset: asset.amount
            .mul(
              this.osmosisQueries.queryGammPoolShare.getAllGammShareRatio(
                this.bech32Address,
                this.poolId
              )
            )
            .trim(true)
            .shrink(true),
        };
      }) ?? []
    );
  }

  @computed
  get userLockedAssets() {
    // aggregate user-applicable durations
    const durationMap = new Map<number, Duration>();
    this.osmosisQueries.queryLockableDurations.lockableDurations.forEach((d) =>
      durationMap.set(d.asMilliseconds(), d)
    );
    this.osmosisQueries.queryAccountLocked
      .get(this.bech32Address)
      .lockedCoins.forEach(({ duration: d }) =>
        durationMap.set(d.asMilliseconds(), d)
      );

    return this.osmosisQueries.queryGammPoolShare
      .getShareLockedAssets(
        this.bech32Address,
        this.poolId,
        Array.from(durationMap.values())
      )
      .map((lockedAsset) =>
        // calculate APR% for this pool asset
        ({
          ...lockedAsset,
          apr: this.osmosisQueries.queryIncentivizedPools.isIncentivized(
            this.poolId
          )
            ? new RatePretty(
                this.osmosisQueries.queryIncentivizedPools.computeApr(
                  this.poolId,
                  lockedAsset.duration,
                  this.priceStore,
                  this._fiatCurrency
                )
              )
            : undefined,
        })
      );
  }

  @computed
  get userUnlockingAssets() {
    // aggregate user-applicable durations
    const durationMap = new Map<number, Duration>();
    this.osmosisQueries.queryLockableDurations.lockableDurations.forEach((d) =>
      durationMap.set(d.asMilliseconds(), d)
    );
    this.osmosisQueries.queryAccountLocked
      .get(this.bech32Address)
      .unlockingCoins.forEach(({ duration: d }) =>
        durationMap.set(d.asMilliseconds(), d)
      );

    const poolShareCurrency =
      this.osmosisQueries.queryGammPoolShare.makeShareCurrency(this.poolId);
    return Array.from(durationMap.values())
      .map(
        (duration) => {
          const unlockings = this.osmosisQueries.queryAccountLocked
            .get(this.bech32Address)
            .getUnlockingCoinWithDuration(poolShareCurrency, duration);

          return unlockings.map((unlocking) => ({
            ...unlocking,
            duration,
          }));
        },
        [] as {
          duration: Duration;
          amount: CoinPretty;
          endTime: Date;
        }[]
      )
      .flat();
  }

  @computed
  get userCanDepool() {
    if (
      this.osmosisQueries.queryLockedCoins
        .get(this.bech32Address)
        .lockedCoins.find(
          (coin) =>
            coin.currency.coinMinimalDenom === `gamm/pool/${this.poolId}`
        )
    ) {
      return true;
    }

    if (
      this.osmosisQueries.queryUnlockingCoins
        .get(this.bech32Address)
        .unlockingCoins.find(
          (coin) =>
            coin.currency.coinMinimalDenom === `gamm/pool/${this.poolId}`
        )
    ) {
      return true;
    }

    return false;
  }

  @computed
  get allExternalGauges(): ExternalSharesGauge[] {
    const queryPoolGuageIds = this.osmosisQueries.queryPoolsGaugeIds.get(
      this.poolId
    );

    return (
      queryPoolGuageIds.gaugeIdsWithDuration
        ?.map(({ gaugeId }) => {
          const gauge = this.externalQueries.queryActiveGauges.get(gaugeId);
          if (!gauge) return;

          const isInternalGauge =
            this.osmosisQueries.queryIncentivizedPools.getIncentivizedGaugeId(
              this.poolId,
              gauge.lockupDuration
            ) !== undefined;

          const startTime = dayjs(gauge.startTime);
          const now = new Date();

          if (
            startTime.isAfter(now) ||
            isInternalGauge ||
            !(gauge.remainingEpoch > 1)
          ) {
            return;
          }

          return {
            id: gaugeId,
            duration: gauge.lockupDuration,
            remainingEpochs: gauge.remainingEpoch,
          };
        })
        .filter((gauge): gauge is ExternalSharesGauge => gauge !== undefined) ??
      []
    );
  }

  @computed
  get userStats():
    | {
        totalShares: CoinPretty;
        totalShareValue: PricePretty;
        bondedValue: PricePretty;
        unbondedValue: PricePretty;
      }
    | undefined {
    const totalShares = this.osmosisQueries.queryGammPoolShare.getAllGammShare(
      this.bech32Address,
      this.poolId
    );

    if (totalShares.toDec().isZero()) return;

    return {
      totalShares,
      totalShareValue: this.userShareValue,
      bondedValue: this.userBondedValue,
      unbondedValue: this.userAvailableValue,
    };
  }
}

/** Stores a map of additional details for each share pool (balancer or stable) ID. */
export class ObservableSharePoolDetails extends HasMapStore<ObservableSharePoolDetail> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly accountStore: IAccountStore,
    protected readonly priceStore: IPriceStore
  ) {
    super(
      (poolId: string) =>
        new ObservableSharePoolDetail(
          poolId,
          this.osmosisChainId,
          this.queriesStore,
          this.externalQueries,
          this.accountStore,
          this.priceStore
        )
    );
  }

  get(poolId: string): ObservableSharePoolDetail {
    return super.get(poolId);
  }
}
