import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { Duration } from "dayjs/plugin/duration";
import dayjs from "dayjs";
import {
  CoinPretty,
  RatePretty,
  Dec,
  PricePretty,
  IntPretty,
} from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import {
  ObservableQueryPoolDetails,
  ObservableQuerySuperfluidPool,
  ExternalGauge,
  ObservableQueryAccountLocked,
  ObservableQueryGuage,
  ObservableQueryIncentivizedPools,
} from "../../queries";
import { ObservableQueryPoolFeesMetrics } from "../../queries-external";
import { IPriceStore } from "../../price";
import { UserConfig } from "../user-config";

export type BondableDuration = {
  duration: Duration;
  userShares: CoinPretty;
  userShareValue: PricePretty;
  userUnlockingShares?: { shares: CoinPretty; endTime?: Date };
  aggregateApr: RatePretty;
  swapFeeApr: RatePretty;
  swapFeeDailyReward: PricePretty;
  incentivesBreakdown: {
    dailyPoolReward: CoinPretty;
    apr: RatePretty;
    numDaysRemaining?: number;
  }[];
  /** Both `delegated` and `undelegating` will be `undefined` if the user may "Go superfluid". */
  superfluid?: {
    apr: RatePretty;
    commission?: RatePretty;
    validatorMoniker?: string;
    validatorLogoUrl?: string;
    delegated?: CoinPretty;
    undelegating?: CoinPretty;
  };
};

export class ObservableBondLiquidityConfig extends UserConfig {
  constructor(
    protected readonly poolDetails: ObservableQueryPoolDetails,
    protected readonly superfluidPool: ObservableQuerySuperfluidPool,
    protected readonly priceStore: IPriceStore,
    protected readonly queryFeeMetrics: ObservableQueryPoolFeesMetrics,
    protected readonly queries: {
      queryAccountLocked: ObservableQueryAccountLocked;
      queryGauge: ObservableQueryGuage;
      queryIncentivizedPools: ObservableQueryIncentivizedPools;
    }
  ) {
    super();
    makeObservable(this);
  }

  /** Calculates the stop in the bonding process the user is in.
   *
   *  1. Liquidity needs to be added
   *  2. Liquidity needs to be bonded
   */
  readonly calculateBondLevel = computedFn(
    (bondableDurations: BondableDuration[]): 1 | 2 | undefined => {
      if (
        this.poolDetails?.userAvailableValue.toDec().gt(new Dec(0)) &&
        bondableDurations.length > 0
      )
        return 2;

      if (this.poolDetails?.userAvailableValue.toDec().isZero()) return 1;
    }
  );

  /** Gets all available durations for user to bond in, with a breakdown of the assets incentivizing the duration. Internal OSMO incentives & swap fees included in breakdown. */
  readonly getBondableAllowedDurations = computedFn(
    (
      findCurrency: (denom: string) => AppCurrency | undefined,
      allowedGauges: { gaugeId: string; denom: string }[] | undefined
    ): BondableDuration[] => {
      const poolId = this.poolDetails.pool.id;
      const gauges = this.superfluidPool.gaugesWithSuperfluidApr;

      const queryLockedCoin = this.queries.queryAccountLocked.get(
        this.bech32Address
      );

      const externalGauges = allowedGauges
        ? this.poolDetails.queryAllowedExternalGauges(
            findCurrency,
            allowedGauges
          )
        : [];

      /** Set of all available durations. */
      const durationsMsSet = new Set<number>();

      // Get all durations for locks with this pool's share currency
      (
        queryLockedCoin.lockedCoins as {
          amount: CoinPretty;
          duration: Duration;
        }[]
      )
        .concat(queryLockedCoin.unlockingCoins)
        .forEach((coin) => {
          if (
            coin.amount.currency.coinMinimalDenom ===
            this.poolDetails.poolShareCurrency.coinMinimalDenom
          ) {
            durationsMsSet.add(coin.duration.asMilliseconds());
          }
        });

      (gauges as { duration: Duration }[])
        .concat(externalGauges as { duration: Duration }[])
        .forEach((gauge) => {
          durationsMsSet.add(gauge.duration.asMilliseconds());
        });

      return Array.from(durationsMsSet.values())
        .sort()
        .reverse()
        .map((durationMs) => {
          const curDuration = dayjs.duration({
            milliseconds: durationMs,
          });

          /** There is only one internal gauge of a chain-configured lockable duration (1,7,14 days). */
          const internalGaugeOfDuration = gauges.find(
            (gauge) => gauge.duration.asMilliseconds() === durationMs
          );
          const externalGaugesOfDuration = externalGauges.reduce<
            ExternalGauge[]
          >((gauges, externalGauge) => {
            if (externalGauge.duration.asMilliseconds() === durationMs) {
              gauges.push(externalGauge);
            }
            return gauges;
          }, []);
          const lockedUserShares = queryLockedCoin.getLockedCoinWithDuration(
            this.poolDetails.poolShareCurrency,
            curDuration
          ).amount;
          const totalShares = this.poolDetails.pool.totalShare;
          const poolTvl = this.poolDetails.totalValueLocked;
          const userShareValue = poolTvl.mul(
            new IntPretty(lockedUserShares.quo(totalShares))
          );

          const unlockingUserShares =
            queryLockedCoin.getUnlockingCoinWithDuration(
              this.poolDetails.poolShareCurrency,
              curDuration
            );
          const userUnlockingShares =
            unlockingUserShares.length > 0
              ? {
                  // only return soonest unlocking shares
                  shares:
                    unlockingUserShares[0].amount ??
                    new CoinPretty(this.poolDetails.poolShareCurrency, 0),
                  endTime: unlockingUserShares[0].endTime,
                }
              : undefined;

          const incentivesBreakdown: BondableDuration["incentivesBreakdown"] =
            [];

          // push single internal incentive for current duration
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
                incentivesBreakdown.push({
                  dailyPoolReward,
                  apr,
                });
              }
            }
          }

          // push external incentives to current duration
          externalGaugesOfDuration.forEach(({ id }) => {
            const queryGauge = this.queries.queryGauge.get(id);
            const allowedGauge = allowedGauges?.find(
              ({ gaugeId }) => gaugeId === id
            );
            if (!allowedGauge) return;

            const currency = findCurrency(allowedGauge.denom);
            const fiatCurrency = this.priceStore.getFiatCurrency(
              this.priceStore.defaultVsCurrency
            );
            if (!currency || !fiatCurrency) return;

            incentivesBreakdown.push({
              dailyPoolReward: queryGauge
                .getRemainingCoin(currency)
                .quo(new Dec(queryGauge.remainingEpoch)),
              apr: this.queries.queryIncentivizedPools.computeExternalIncentiveGaugeAPR(
                poolId,
                allowedGauge.gaugeId,
                allowedGauge.denom,
                this.priceStore
              ),
              numDaysRemaining: queryGauge.remainingEpoch,
            });
          });

          // add superfluid data if highest duration
          const sfsDuration = this.poolDetails.longestDuration;
          let superfluid: BondableDuration["superfluid"] | undefined;
          if (
            this.superfluidPool.isSuperfluid &&
            this.superfluidPool.superfluid &&
            sfsDuration &&
            curDuration.asSeconds() === sfsDuration.asSeconds()
          ) {
            const delegation =
              (this.superfluidPool.superfluid.delegations?.length ?? 0) > 0
                ? this.superfluidPool.superfluid.delegations?.[0]
                : undefined;
            const undelegation =
              (this.superfluidPool.superfluid.undelegations?.length ?? 0) > 0
                ? this.superfluidPool.superfluid.undelegations?.[0]
                : undefined;

            superfluid = {
              apr: this.superfluidPool.superfluidApr,
              commission: delegation?.validatorCommission,
              delegated: !this.superfluidPool.superfluid.upgradeableLpLockIds
                ? delegation?.amount
                : undefined,
              undelegating: !this.superfluidPool.superfluid.upgradeableLpLockIds
                ? undelegation?.amount
                : undefined,
              validatorMoniker: delegation?.validatorName,
              validatorLogoUrl: delegation?.validatorImgSrc,
            };
          }

          let aggregateApr = incentivesBreakdown.reduce<RatePretty>(
            (sum, { apr }) => sum.add(apr),
            new RatePretty(0)
          );
          const swapFeeApr = this.queryFeeMetrics.get7dPoolFeeApr(
            this.poolDetails.pool,
            this.priceStore
          );
          aggregateApr = aggregateApr.add(swapFeeApr);
          if (superfluid) aggregateApr = aggregateApr.add(superfluid.apr);

          return {
            duration: curDuration,
            userShares: lockedUserShares,
            userShareValue,
            userUnlockingShares,
            aggregateApr,
            swapFeeApr,
            swapFeeDailyReward: this.queryFeeMetrics
              .getPoolFeesMetrics(poolId, this.priceStore)
              .feesSpent7d.quo(new Dec(7)),
            incentivesBreakdown,
            superfluid,
          };
        });
    }
  );
}
