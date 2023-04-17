import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, Int, RatePretty } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../../price";
import { ObservableQueryEpochs } from "../epochs";
import { ObservableQueryGauges } from "../incentives";
import {
  ObservableQueryEpochProvisions,
  ObservableQueryMintParmas,
} from "../mint";
import { ObservableQueryPoolGetter } from "../pools";
import { ObservableQueryDistrInfo } from "./distr-info";
import { ObservableQueryLockableDurations } from "./lockable-durations";
import { IncentivizedPools } from "./types";

export class ObservableQueryIncentivizedPools extends ObservableChainQuery<IncentivizedPools> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly queryLockableDurations: ObservableQueryLockableDurations,
    protected readonly queryDistrInfo: ObservableQueryDistrInfo,
    protected readonly queryPools: ObservableQueryPoolGetter,
    protected readonly queryMintParmas: ObservableQueryMintParmas,
    protected readonly queryEpochProvision: ObservableQueryEpochProvisions,
    protected readonly queryEpochs: ObservableQueryEpochs,
    protected readonly queryGauge: ObservableQueryGauges
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/pool-incentives/v1beta1/incentivized_pools"
    );

    makeObservable(this);
  }

  /** Internally incentivized pools. */
  @computed
  get incentivizedPools(): string[] {
    if (!this.response) {
      return [];
    }

    const result = this.response.data.incentivized_pools.map(
      (incentivizedPool) => incentivizedPool.pool_id
    );

    // Remove the duplicates.
    return [...new Set(result)];
  }

  /** Is incentivized internally. */
  readonly isIncentivized = computedFn((poolId: string) => {
    return this.incentivizedPools.includes(poolId);
  });

  readonly isGaugeIdInternalIncentive = computedFn((gaugeId: string) => {
    if (!this.response) {
      return false;
    }

    return this.response.data.incentivized_pools.some(
      (incentivizedPool) => incentivizedPool.gauge_id === gaugeId
    );
  });

  /** Internal incentives (OSMO). */
  readonly getIncentivizedGaugeId = computedFn(
    (poolId: string, duration: Duration): string | undefined => {
      if (!this.response) {
        return;
      }

      const incentivized = this.response.data.incentivized_pools.find(
        (data) => {
          return (
            data.pool_id === poolId &&
            dayjs
              .duration(
                parseInt(data.lockable_duration.replace("s", "")) * 1000
              )
              .asMilliseconds() === duration.asMilliseconds()
          );
        }
      );

      if (incentivized) {
        return incentivized.gauge_id;
      }
    }
  );

  /**
   * Returns the APR of the longest lockable duration.
   */
  readonly computeMostApr = computedFn(
    (poolId: string, priceStore: IPriceStore): RatePretty => {
      if (!this.isIncentivized(poolId)) {
        return new RatePretty(new Dec(0));
      }

      const fiatCurrency = priceStore.getFiatCurrency(
        priceStore.defaultVsCurrency
      )!;

      // 내림차순으로 정렬한다.
      const lockableDurations = this.queryLockableDurations.lockableDurations
        .slice()
        .sort((v1, v2) => {
          return v1.asMilliseconds() > v2.asMilliseconds() ? -1 : 1;
        });

      if (lockableDurations.length === 0) {
        return new RatePretty(new Dec(0));
      }

      return this.computeApr(
        poolId,
        lockableDurations[0],
        priceStore,
        fiatCurrency
      );
    }
  );

  /**
   * Computes the external incentive APR for the given gaugeId and denom
   */
  readonly computeExternalIncentiveGaugeAPR = computedFn(
    (
      poolId: string,
      gaugeId: string,
      denom: string,
      priceStore: IPriceStore
    ): RatePretty => {
      const observableGauge = this.queryGauge.get(gaugeId);

      if (observableGauge.remainingEpoch < 1) {
        return new RatePretty(new Dec(0));
      }

      const chainInfo = this.chainGetter.getChain(this.chainId);

      const mintCurrency = chainInfo.findCurrency(denom);
      const fiatCurrency = priceStore.getFiatCurrency(
        priceStore.defaultVsCurrency
      );

      if (!mintCurrency?.coinGeckoId || !fiatCurrency) {
        return new RatePretty(new Dec(0));
      }

      const rewardAmount = observableGauge.coins.find(
        (coin) =>
          coin.remaining.currency.coinMinimalDenom ===
          mintCurrency.coinMinimalDenom
      )?.remaining;

      const pool = this.queryPools.getPool(poolId);

      if (!pool || !rewardAmount) {
        return new RatePretty(new Dec(0));
      }

      const epochIdentifier = this.queryMintParmas.epochIdentifier;

      if (!epochIdentifier) {
        return new RatePretty(new Dec(0));
      }

      const epoch = this.queryEpochs.getEpoch(epochIdentifier);

      if (!mintCurrency?.coinGeckoId || !epoch.duration) {
        return new RatePretty(new Dec(0));
      }

      const mintPrice = priceStore.getPrice(
        mintCurrency.coinGeckoId,
        fiatCurrency.currency
      );

      const poolTVL = pool.computeTotalValueLocked(priceStore);

      if (!mintPrice || !poolTVL.toDec().gt(new Dec(0))) {
        return new RatePretty(new Dec(0));
      }

      const epochProvision = this.queryEpochProvision.epochProvisions;

      if (!epochProvision) {
        return new RatePretty(new Dec(0));
      }

      const numEpochPerYear =
        dayjs
          .duration({
            years: 1,
          })
          .asMilliseconds() / epoch.duration.asMilliseconds();

      const externalIncentivePrice = new Dec(mintPrice.toString()).mul(
        rewardAmount.toDec()
      );

      const yearProvision = new Dec(numEpochPerYear.toString()).quo(
        new Dec(observableGauge.remainingEpoch)
      );

      // coins = (X coin's price in USD * remaining incentives in X tokens * (365 / remaining days in gauge))
      // apr = coins / TVL of pool

      return new RatePretty(
        externalIncentivePrice.mul(yearProvision).quo(poolTVL.toDec())
      );
    }
  );

  /**
   * 리워드를 받을 수 있는 풀의 연당 이익률을 반환한다.
   * 리워드를 받을 수 없는 풀일 경우 0를 리턴한다.
   */
  readonly computeApr = computedFn(
    (
      poolId: string,
      duration: Duration,
      priceStore: IPriceStore,
      fiatCurrency: FiatCurrency
    ): RatePretty => {
      if (!this.isIncentivized(poolId)) {
        return new RatePretty(new Dec(0));
      }

      // 오름차순으로 정렬한다.
      const lockableDurations = this.queryLockableDurations.lockableDurations
        .slice()
        .sort((v1, v2) => {
          return v1.asMilliseconds() > v2.asMilliseconds() ? 1 : -1;
        });

      // 사실 pool-incentives 모듈의 lockable duration에 포함되지 않더라도 리워드는 받을 수 있지만
      // 계산하기 귀찮아지므로 일단은 lockable durations에 포함된 duration만 다루도록 하자.
      if (
        !lockableDurations.find(
          (lockableDuration) =>
            lockableDuration.asMilliseconds() === duration.asMilliseconds()
        )
      ) {
        return new RatePretty(new Dec(0));
      }

      let apr = this.computeAprForSpecificDuration(
        poolId,
        duration,
        priceStore,
        fiatCurrency
      );

      for (const lockableDuration of lockableDurations) {
        if (lockableDuration.asMilliseconds() >= duration.asMilliseconds()) {
          break;
        }

        apr = apr.add(
          this.computeAprForSpecificDuration(
            poolId,
            lockableDuration,
            priceStore,
            fiatCurrency
          )
        );
      }

      return apr;
    }
  );

  readonly computeDailyRewardForDuration = computedFn(
    (
      poolId: string,
      duration: Duration,
      priceStore: IPriceStore,
      fiatCurrency: FiatCurrency
    ): CoinPretty | undefined => {
      const gaugeId = this.getIncentivizedGaugeId(poolId, duration);
      const incentiveBondDurations =
        this.queryLockableDurations.lockableDurations;

      if (this.incentivizedPools.includes(poolId) && gaugeId) {
        const pool = this.queryPools.getPool(poolId);
        if (pool) {
          const mintDenom = this.queryMintParmas.mintDenom;
          const epochIdentifier = this.queryMintParmas.epochIdentifier;

          if (mintDenom && epochIdentifier) {
            const epoch = this.queryEpochs.getEpoch(epochIdentifier);

            const chainInfo = this.chainGetter.getChain(this.chainId);
            const mintCurrency = chainInfo.findCurrency(mintDenom);

            if (mintCurrency && mintCurrency.coinGeckoId && epoch.duration) {
              const totalWeight = this.queryDistrInfo.totalWeight;
              const potWeight = this.queryDistrInfo.getWeight(gaugeId);
              const mintPrice = priceStore.getPrice(
                mintCurrency.coinGeckoId,
                fiatCurrency.currency
              );
              const poolTVL = pool.computeTotalValueLocked(priceStore);
              if (
                totalWeight.gt(new Int(0)) &&
                potWeight.gt(new Int(0)) &&
                mintPrice &&
                poolTVL.toDec().gt(new Dec(0))
              ) {
                const epochProvision = this.queryEpochProvision.epochProvisions;

                if (epochProvision) {
                  const numEpochPerYear =
                    dayjs
                      .duration({
                        years: 1,
                      })
                      .asMilliseconds() / epoch.duration.asMilliseconds();

                  /** Issued over year. */
                  const yearProvision = epochProvision.mul(
                    new Dec(numEpochPerYear.toString())
                  );

                  const yearProvisionToPots = yearProvision.mul(
                    this.queryMintParmas.distributionProportions.poolIncentives
                  );

                  const curInternalBondDurationIndex =
                    incentiveBondDurations.reduce(
                      (defaultIndex, bondDuration, index) => {
                        if (
                          bondDuration.asMilliseconds() ===
                          duration.asMilliseconds()
                        ) {
                          return index;
                        }
                        return defaultIndex;
                      },
                      0
                    );

                  const priorDuration =
                    incentiveBondDurations[curInternalBondDurationIndex - 1];

                  return yearProvisionToPots
                    .mul(new Dec(potWeight).quo(new Dec(totalWeight)))
                    .quo(new Dec(numEpochPerYear))
                    .add(
                      // for internal incentives, higher bonding periods accrue incentives from prior gauges
                      priorDuration
                        ? this.computeDailyRewardForDuration(
                            poolId,
                            priorDuration,
                            priceStore,
                            fiatCurrency
                          ) ?? new Dec(0)
                        : new Dec(0)
                    );
                }
              }
            }
          }
        }
      }
    }
  );

  protected computeAprForSpecificDuration(
    poolId: string,
    duration: Duration,
    priceStore: IPriceStore,
    fiatCurrency: FiatCurrency
  ): RatePretty {
    const gaugeId = this.getIncentivizedGaugeId(poolId, duration);

    if (this.incentivizedPools.includes(poolId) && gaugeId) {
      const pool = this.queryPools.getPool(poolId);
      if (pool) {
        const mintDenom = this.queryMintParmas.mintDenom;
        const epochIdentifier = this.queryMintParmas.epochIdentifier;

        if (mintDenom && epochIdentifier) {
          const epoch = this.queryEpochs.getEpoch(epochIdentifier);

          const chainInfo = this.chainGetter.getChain(this.chainId);
          const mintCurrency = chainInfo.findCurrency(mintDenom);

          if (mintCurrency && mintCurrency.coinGeckoId && epoch.duration) {
            const totalWeight = this.queryDistrInfo.totalWeight;
            // 99999918
            const potWeight = this.queryDistrInfo.getWeight(gaugeId);
            const mintPrice = priceStore.getPrice(
              mintCurrency.coinGeckoId,
              fiatCurrency.currency
            );

            const poolTVL = pool.computeTotalValueLocked(priceStore);

            if (
              totalWeight.gt(new Int(0)) &&
              potWeight.gt(new Int(0)) &&
              mintPrice &&
              poolTVL.toDec().gt(new Dec(0))
            ) {
              // 에포치마다 발행되는 민팅 코인의 수.
              const epochProvision = this.queryEpochProvision.epochProvisions;

              if (epochProvision) {
                const numEpochPerYear =
                  dayjs
                    .duration({
                      years: 1,
                    })
                    .asMilliseconds() / epoch.duration.asMilliseconds();

                /** Issued over year. */
                const yearProvision = epochProvision.mul(
                  new Dec(numEpochPerYear.toString())
                );
                const yearProvisionToPots = yearProvision.mul(
                  // Probably a decimal value
                  this.queryMintParmas.distributionProportions.poolIncentives
                );
                const yearProvisionToPot = yearProvisionToPots.mul(
                  new Dec(potWeight).quo(new Dec(totalWeight))
                );

                const yearProvisionToPotPrice = new Dec(
                  mintPrice.toString()
                ).mul(yearProvisionToPot.toDec());

                // 백분률로 반환한다.
                return new RatePretty(
                  yearProvisionToPotPrice.quo(poolTVL.toDec())
                );
              }
            }
          }
        }
      }
    }

    return new RatePretty(new Dec(0));
  }

  @computed
  get isAprFetching(): boolean {
    return (
      this.queryPools.isFetching ||
      (!this.queryMintParmas.response && !this.queryPools.error) ||
      (!this.queryEpochs.response && !this.queryEpochs.error) ||
      (!this.queryDistrInfo.response && !this.queryDistrInfo.error) ||
      (!this.queryEpochProvision.response && !this.queryEpochProvision.error)
    );
  }
}
