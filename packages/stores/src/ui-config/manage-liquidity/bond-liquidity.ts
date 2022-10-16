import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { Duration } from "dayjs/plugin/duration";
import dayjs from "dayjs";
import { CoinPretty, RatePretty, Dec } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import {
  ObservableQueryPoolDetails,
  ObservableQuerySuperfluidPool,
  ExternalGauge,
  ObservableQueryAccountLocked,
  ObservableQueryGuage,
  ObservableQueryIncentivizedPools,
} from "../../queries";
import { IPriceStore } from "../../price";
import { UserConfig } from "../user-config";

export type BondableDuration = {
  duration: Duration;
  userShares: CoinPretty;
  userUnlockingShares: CoinPretty;
  aggregateApr: RatePretty;
  incentivesBreakdown: {
    dailyPoolReward: CoinPretty;
    apr: RatePretty;
    numDaysRemaining?: number;
    superfluid?: {
      apr: RatePretty;
      validatorMoniker?: string;
      validatorLogoUrl?: string;
      delegated?: CoinPretty;
      undelegating?: CoinPretty;
    };
  }[];
};

export class ObservableBondLiquidityConfig extends UserConfig {
  constructor(
    protected readonly poolDetails: ObservableQueryPoolDetails,
    protected readonly superfluidPool: ObservableQuerySuperfluidPool,
    protected readonly priceStore: IPriceStore,
    protected readonly queries: {
      queryAccountLocked: ObservableQueryAccountLocked;
      queryGauge: ObservableQueryGuage;
      queryIncentivizedPools: ObservableQueryIncentivizedPools;
    }
  ) {
    super();
    makeObservable(this);
  }

  /** Gets all available durations for user to bond in, with a breakdown of the assets incentivizing the duration. Internal OSMO incentives included in breakdown. */
  readonly getBondableAllowedDurations = computedFn(
    (
      poolId: string,
      findCurrency: (denom: string) => AppCurrency | undefined,
      allowedGauges: { gaugeId: string; denom: string }[] | undefined
    ): BondableDuration[] => {
      const gauges = this.superfluidPool.gaugesWithSuperfluidApr;

      if (!allowedGauges) return [];

      const externalGauges = this.poolDetails.queryAllowedExternalGauges(
        findCurrency,
        allowedGauges
      );

      /** Set of all available durations. */
      const durationsMsSet = new Set<number>();

      (gauges as { duration: Duration }[])
        .concat(externalGauges as { duration: Duration }[])
        .forEach((gauge) => {
          durationsMsSet.add(gauge.duration.asMilliseconds());
        });

      return Array.from(durationsMsSet.values()).map((durationMs) => {
        const curDuration = dayjs.duration({
          milliseconds: durationMs,
        });

        /** There is only one internal gauge of a chain-configured lockable duration (1,7,14 days). */
        const internalGaugeOfDuration = gauges.find(
          (gauge) => gauge.duration.asMilliseconds() === durationMs
        );
        const externalGaugesOfDuration = externalGauges.reduce<ExternalGauge[]>(
          (gauges, externalGauge) => {
            if (externalGauge.duration.asMilliseconds() === durationMs) {
              gauges.push(externalGauge);
            }
            return gauges;
          },
          []
        );

        let aggregateApr = new RatePretty(0);

        if (internalGaugeOfDuration)
          aggregateApr = aggregateApr.add(internalGaugeOfDuration.apr);
        // TODO: sum APR of each external gauge

        const queryLockedCoin = this.queries.queryAccountLocked.get(
          this.bech32Address
        );
        const userShares = queryLockedCoin.getLockedCoinWithDuration(
          this.poolDetails.poolShareCurrency,
          curDuration
        ).amount;
        const allUnlockingCoins = queryLockedCoin.getUnlockingCoinWithDuration(
          this.poolDetails.poolShareCurrency,
          curDuration
        );
        const userUnlockingShares =
          allUnlockingCoins.length > 0
            ? allUnlockingCoins[0]?.amount ??
              new CoinPretty(this.poolDetails.poolShareCurrency, 0)
            : new CoinPretty(this.poolDetails.poolShareCurrency, 0);

        const incentivesBreakdown: BondableDuration["incentivesBreakdown"] = [];

        // push internal incentives for current duration
        if (internalGaugeOfDuration) {
          const { apr } = internalGaugeOfDuration;

          const fiatCurrency = this.priceStore.getFiatCurrency(
            this.priceStore.defaultVsCurrency
          );

          if (fiatCurrency) {
            const dailyPoolReward =
              this.queries.queryIncentivizedPools.computeDailyRewardForDuration(
                poolId,
                curDuration,
                this.priceStore,
                fiatCurrency
              );

            if (dailyPoolReward) {
              // add superfluid data to highest duration
              const sfsDuration = this.poolDetails.longestDuration;
              let superfluid:
                | BondableDuration["incentivesBreakdown"][0]["superfluid"]
                | undefined;
              if (
                this.superfluidPool.isSuperfluid &&
                sfsDuration &&
                curDuration.asSeconds() === sfsDuration.asSeconds()
              ) {
                superfluid = {
                  apr: this.superfluidPool.superfluidApr,
                };
              }

              incentivesBreakdown.push({
                dailyPoolReward,
                apr,
                superfluid,
              });
            }
          }
        }

        // push external incentives to current duration
        externalGaugesOfDuration.forEach(({ id }) => {
          const queryGauge = this.queries.queryGauge.get(id);
          const allowedGauge = allowedGauges.find(
            ({ gaugeId }) => gaugeId === id
          );
          if (!allowedGauge) return;

          const currency = findCurrency(allowedGauge.denom);
          if (!currency) return;

          incentivesBreakdown.push({
            dailyPoolReward: queryGauge
              .getRemainingCoin(currency)
              .quo(new Dec(queryGauge.remainingEpoch)),
            apr: new RatePretty(0), // TODO: get external incentive apr
          });
        });

        return {
          duration: curDuration,
          userShares,
          userUnlockingShares,
          aggregateApr,
          incentivesBreakdown,
        };
      });
    }
  );
}
