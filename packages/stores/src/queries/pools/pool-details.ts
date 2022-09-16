import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { Duration } from "dayjs/plugin/duration";
import { AppCurrency, FiatCurrency } from "@keplr-wallet/types";
import { PricePretty, Dec, RatePretty, CoinPretty } from "@keplr-wallet/unit";
import { IPriceStore } from "../../price";
import { ObservableQueryGammPoolShare } from "../pool-share";
import {
  ObservableQueryIncentivizedPools,
  ObservableQueryLockableDurations,
} from "../pool-incentives";
import { ObservableQueryGuage, ObservableQueryGuageById } from "../incentives";
import {
  ObservableQueryAccountLocked,
  ObservableQueryAccountLockedCoins,
  ObservableQueryAccountUnlockingCoins,
} from "../lockup";
import { ObservableQueryPool } from "./pool";

/** Convenience store for getting common details of a pool via many other query stores. */
export class ObservableQueryPoolDetails {
  constructor(
    protected readonly bech32Address: string,
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
    },
    protected readonly priceStore: IPriceStore
  ) {
    makeObservable(this);
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
  get lockupGauges() {
    return this.queries.queryLockableDurations.lockableDurations.map(
      (duration, index) => {
        const apr = this.queries.queryIncentivizedPools.computeAPY(
          this.queryPool.id,
          duration,
          this.priceStore,
          this.fiatCurrency
        );

        return {
          id: index.toString(),
          apr,
          duration,
        };
      }
    );
  }

  @computed
  get userLockedValue(): PricePretty {
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
    return this.queryPool.totalShare.toDec().equals(new Dec(0))
      ? this.totalValueLocked.mul(
          this.queries.queryGammPoolShare
            .getAvailableGammShare(this.bech32Address, this.queryPool.id)
            .quo(this.queryPool.totalShare)
        )
      : new PricePretty(this.fiatCurrency, new Dec(0));
  }

  @computed
  get userPoolAssets() {
    return this.queryPool.poolAssets.map((asset) => ({
      ratio: new RatePretty(asset.weight.quo(this.queryPool.totalWeight)),
      asset: asset.amount
        .mul(
          this.queries.queryGammPoolShare.getAllGammShareRatio(
            this.bech32Address,
            this.queryPool.id
          )
        )
        .trim(true)
        .shrink(true),
    }));
  }

  @computed
  get userLockedAssets() {
    return this.queries.queryGammPoolShare
      .getShareLockedAssets(
        this.bech32Address,
        this.queryPool.id,
        this.queries.queryLockableDurations.lockableDurations
      )
      .map((lockedAsset) =>
        // calculate APR% for this pool asset
        ({
          ...lockedAsset,
          apr: this.queries.queryIncentivizedPools.isIncentivized(
            this.queryPool.id
          )
            ? new RatePretty(
                this.queries.queryIncentivizedPools.computeAPY(
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
    const poolShareCurrency = this.queries.queryGammPoolShare.getShareCurrency(
      this.queryPool.id
    );
    return this.queries.queryLockableDurations.lockableDurations
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
  get gauges() {
    return this.lockableDurations
      .map((duration) => {
        const guageId =
          this.queries.queryIncentivizedPools.getIncentivizedGaugeId(
            this.queryPool.id,
            duration
          );
        if (!guageId) return;

        return this.queries.queryGauge.get(guageId);
      })
      .filter(
        (gauge): gauge is ObservableQueryGuageById => gauge !== undefined
      );
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

  queryExternalGauges = computedFn(
    (
      allowedGauges: { gaugeId: string; denom: string }[],
      findCurrency: (denom: string) => AppCurrency | undefined
    ) => {
      return allowedGauges
        .map(({ gaugeId, denom }) => {
          const observableGauge = this.queries.queryGauge.get(gaugeId);
          const currency = findCurrency(denom);

          if (observableGauge.remainingEpoch < 1) {
            return;
          }

          return {
            duration: observableGauge.lockupDuration.humanize(),
            rewardAmount: currency
              ? observableGauge.getRemainingCoin(currency)
              : undefined,
            remainingEpochs: observableGauge.remainingEpoch,
          };
        })
        .filter(
          (
            gauge
          ): gauge is {
            duration: string;
            rewardAmount: CoinPretty | undefined;
            remainingEpochs: number;
          } => gauge !== undefined
        );
    }
  );
}
