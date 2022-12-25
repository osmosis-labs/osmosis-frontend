import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { Duration } from "dayjs/plugin/duration";
import dayjs from "dayjs";
import { AppCurrency, FiatCurrency } from "@keplr-wallet/types";
import { PricePretty, Dec, RatePretty, CoinPretty } from "@keplr-wallet/unit";
import { IPriceStore } from "../../price";
import { UserConfig } from "../../ui-config";
import { ObservableQueryGammPoolShare } from "../pool-share";
import {
  ObservableQueryIncentivizedPools,
  ObservableQueryLockableDurations,
  ObservableQueryPoolsGaugeIds,
} from "../pool-incentives";
import { ObservableQueryGuage } from "../incentives";
import {
  ObservableQueryAccountLocked,
  ObservableQueryAccountLockedCoins,
  ObservableQueryAccountUnlockingCoins,
} from "../lockup";
import { ObservableQueryPool } from "./pool";
import { ExternalGauge } from "./types";

/** Convenience store for getting common details of a pool via many other query stores. */
export class ObservableQueryPoolDetails extends UserConfig {
  constructor(
    protected readonly fiatCurrency: FiatCurrency,
    protected readonly queryPool: ObservableQueryPool,
    protected readonly queries: {
      queryGammPoolShare: ObservableQueryGammPoolShare;
      queryIncentivizedPools: ObservableQueryIncentivizedPools;
      queryAccountLocked: ObservableQueryAccountLocked;
      queryLockedCoins: ObservableQueryAccountLockedCoins;
      queryUnlockingCoins: ObservableQueryAccountUnlockingCoins;
      queryGauge: ObservableQueryGuage;
      queryLockableDurations: ObservableQueryLockableDurations;
      queryPoolsGaugeIds: ObservableQueryPoolsGaugeIds;
    },
    protected readonly priceStore: IPriceStore
  ) {
    super();

    makeObservable(this);
  }

  @computed
  get pool() {
    return this.queryPool;
  }

  @computed
  get poolShareCurrency() {
    return this.queries.queryGammPoolShare.getShareCurrency(this.queryPool.id);
  }

  @computed
  get isIncentivized() {
    return this.queries.queryIncentivizedPools.isIncentivized(
      this.queryPool.id
    );
  }

  @computed
  get totalValueLocked(): PricePretty {
    return this.queryPool.computeTotalValueLocked(this.priceStore);
  }

  @computed
  get lockableDurations(): Duration[] {
    return this.queries.queryLockableDurations.lockableDurations;
  }

  @computed
  get longestDuration(): Duration {
    return this.lockableDurations[this.lockableDurations.length - 1];
  }

  @computed
  get internalGauges() {
    return this.queries.queryLockableDurations.lockableDurations
      .map((duration) => {
        const gaugeId =
          this.queries.queryIncentivizedPools.getIncentivizedGaugeId(
            this.queryPool.id,
            duration
          );

        if (!gaugeId) return;

        const gauge = this.queries.queryGauge.get(gaugeId);

        const apr = this.queries.queryIncentivizedPools.computeApr(
          this.queryPool.id,
          gauge.lockupDuration,
          this.priceStore,
          this.fiatCurrency
        );

        return {
          id: gaugeId,
          duration,
          apr,
          isLoading: gauge.isFetching,
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
  get userShareValue(): PricePretty {
    return this.totalValueLocked.mul(
      this.queries.queryGammPoolShare.getAllGammShareRatio(
        this.bech32Address,
        this.queryPool.id
      )
    );
  }

  @computed
  get userBondedValue(): PricePretty {
    return this.queries.queryGammPoolShare.getLockedGammShareValue(
      this.bech32Address,
      this.queryPool.id,
      this.totalValueLocked,
      this.fiatCurrency
    );
  }

  @computed
  get userAvailableValue(): PricePretty {
    return !this.queryPool.totalShare.toDec().equals(new Dec(0))
      ? this.totalValueLocked.mul(
          this.queries.queryGammPoolShare
            .getAvailableGammShare(this.bech32Address, this.queryPool.id)
            .quo(this.queryPool.totalShare)
        )
      : new PricePretty(this.fiatCurrency, new Dec(0));
  }

  @computed
  get userPoolAssets() {
    return this.queryPool.poolAssets.map((asset) => {
      const weightedAsset = this.queryPool.weightedPoolInfo?.assets.find(
        ({ denom }) => denom === asset.amount.currency.coinMinimalDenom
      );
      const totalWeight = this.queryPool.weightedPoolInfo?.totalWeight;

      return {
        ratio:
          weightedAsset && totalWeight
            ? new RatePretty(weightedAsset.weight.quo(totalWeight))
            : new RatePretty(0),
        asset: asset.amount
          .mul(
            this.queries.queryGammPoolShare.getAllGammShareRatio(
              this.bech32Address,
              this.queryPool.id
            )
          )
          .trim(true)
          .shrink(true),
      };
    });
  }

  @computed
  get userLockedAssets() {
    // aggregate user-applicable durations
    const durationMap = new Map<number, Duration>();
    this.queries.queryLockableDurations.lockableDurations.forEach((d) =>
      durationMap.set(d.asMilliseconds(), d)
    );
    this.queries.queryAccountLocked
      .get(this.bech32Address)
      .lockedCoins.forEach(({ duration: d }) =>
        durationMap.set(d.asMilliseconds(), d)
      );

    return this.queries.queryGammPoolShare
      .getShareLockedAssets(
        this.bech32Address,
        this.queryPool.id,
        Array.from(durationMap.values())
      )
      .map((lockedAsset) =>
        // calculate APR% for this pool asset
        ({
          ...lockedAsset,
          apr: this.queries.queryIncentivizedPools.isIncentivized(
            this.queryPool.id
          )
            ? new RatePretty(
                this.queries.queryIncentivizedPools.computeApr(
                  this.queryPool.id,
                  lockedAsset.duration,
                  this.priceStore,
                  this.fiatCurrency
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
    this.queries.queryLockableDurations.lockableDurations.forEach((d) =>
      durationMap.set(d.asMilliseconds(), d)
    );
    this.queries.queryAccountLocked
      .get(this.bech32Address)
      .unlockingCoins.forEach(({ duration: d }) =>
        durationMap.set(d.asMilliseconds(), d)
      );

    const poolShareCurrency = this.queries.queryGammPoolShare.getShareCurrency(
      this.queryPool.id
    );
    return Array.from(durationMap.values())
      .map(
        (duration) => {
          const unlockings = this.queries.queryAccountLocked
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
      this.queries.queryLockedCoins
        .get(this.bech32Address)
        .lockedCoins.find(
          (coin) =>
            coin.currency.coinMinimalDenom === `gamm/pool/${this.queryPool.id}`
        )
    ) {
      return true;
    }

    if (
      this.queries.queryUnlockingCoins
        .get(this.bech32Address)
        .unlockingCoins.find(
          (coin) =>
            coin.currency.coinMinimalDenom === `gamm/pool/${this.queryPool.id}`
        )
    ) {
      return true;
    }

    return false;
  }

  @computed
  get allExternalGauges(): ExternalGauge[] {
    const queryPoolGuageIds = this.queries.queryPoolsGaugeIds.get(
      this.queryPool.id
    );

    return (
      queryPoolGuageIds.gaugeIdsWithDuration
        ?.map(({ gaugeId }) => {
          const gauge = this.queries.queryGauge.get(gaugeId);
          const isInternalGauge =
            this.queries.queryIncentivizedPools.getIncentivizedGaugeId(
              this.queryPool.id,
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
        .filter((gauge): gauge is ExternalGauge => gauge !== undefined) ?? []
    );
  }

  @computed
  get userStats():
    | {
        totalShares: CoinPretty;
        totalShareValue: PricePretty;
        bondedValue: PricePretty;
        unbondedValue: PricePretty;
        currentDailyEarnings?: PricePretty;
      }
    | undefined {
    const totalShares = this.queries.queryGammPoolShare.getAllGammShare(
      this.bech32Address,
      this.queryPool.id
    );

    if (totalShares.toDec().isZero()) return;

    return {
      totalShares,
      totalShareValue: this.userShareValue,
      bondedValue: this.userBondedValue,
      unbondedValue: this.userAvailableValue,
    };
  }

  readonly queryAllowedExternalGauges = computedFn(
    (
      findCurrency: (denom: string) => AppCurrency | undefined,
      allowedGauges: { gaugeId: string; denom: string }[]
    ): ExternalGauge[] => {
      return allowedGauges
        .map(({ gaugeId, denom }) => {
          const observableGauge = this.queries.queryGauge.get(gaugeId);
          const currency = findCurrency(denom);

          if (observableGauge.remainingEpoch < 1) {
            return;
          }

          return {
            id: gaugeId,
            duration: observableGauge.lockupDuration,
            rewardAmount: currency
              ? observableGauge.getRemainingCoin(currency)
              : undefined,
            remainingEpochs: observableGauge.remainingEpoch,
          } as ExternalGauge;
        })
        .filter((gauge): gauge is ExternalGauge => gauge !== undefined);
    }
  );
}
