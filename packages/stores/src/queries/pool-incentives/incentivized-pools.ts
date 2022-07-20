import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { Dec, Int, RatePretty } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { ObservableQueryEpochs } from "../epochs";
import {
  ObservableQueryEpochProvisions,
  ObservableQueryMintParmas,
} from "../mint";
import { ObservableQueryPools } from "../pools";
import { IPriceStore } from "../../price";
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
    protected readonly queryPools: ObservableQueryPools,
    protected readonly queryMintParmas: ObservableQueryMintParmas,
    protected readonly queryEpochProvision: ObservableQueryEpochProvisions,
    protected readonly queryEpochs: ObservableQueryEpochs
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/pool-incentives/v1beta1/incentivized_pools"
    );

    makeObservable(this);
  }

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

  readonly isIncentivized = computedFn((poolId: string) => {
    return this.incentivizedPools.includes(poolId);
  });

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
   * 가장 긴 lockable duration의 apy를 반환한다.
   */
  readonly computeMostAPY = computedFn(
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

      return this.computeAPY(
        poolId,
        lockableDurations[0],
        priceStore,
        fiatCurrency
      );
    }
  );

  /**
   * 리워드를 받을 수 있는 풀의 연당 이익률을 반환한다.
   * 리워드를 받을 수 없는 풀일 경우 0를 리턴한다.
   */
  readonly computeAPY = computedFn(
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

      let apy = this.computeAPYForSpecificDuration(
        poolId,
        duration,
        priceStore,
        fiatCurrency
      );
      for (const lockableDuration of lockableDurations) {
        // 인센티브는 unlock 기간보다 짧은 모든 팟에 분배된다.
        // 그러므로 apy를 계산하기 위해서는 제시된 duration보다 짧은 모든 duration에 대한 apy를 더해줘야 한다.
        if (lockableDuration.asMilliseconds() >= duration.asMilliseconds()) {
          break;
        }

        apy = apy.add(
          this.computeAPYForSpecificDuration(
            poolId,
            lockableDuration,
            priceStore,
            fiatCurrency
          )
        );
      }

      return apy;
    }
  );

  protected computeAPYForSpecificDuration(
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

                const yearProvision = epochProvision.mul(
                  new Dec(numEpochPerYear.toString())
                );
                const yearProvisionToPots = yearProvision.mul(
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
    if (
      (!this.queryPools.response && !this.queryPools.error) ||
      (!this.queryMintParmas.response && !this.queryPools.error) ||
      (!this.queryEpochs.response && !this.queryEpochs.error) ||
      (!this.queryDistrInfo.response && !this.queryDistrInfo.error) ||
      (!this.queryEpochProvision.response && !this.queryEpochProvision.error)
    ) {
      return true;
    }
    return false;
  }
}
