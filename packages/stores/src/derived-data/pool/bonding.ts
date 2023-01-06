import { makeObservable, computed } from "mobx";
import { computedFn } from "mobx-utils";
import { Duration } from "dayjs/plugin/duration";
import dayjs from "dayjs";
import { CoinPretty, RatePretty, Dec, IntPretty } from "@keplr-wallet/unit";
import {
  HasMapStore,
  IQueriesStore,
  IAccountStore,
  ChainGetter,
} from "@keplr-wallet/stores";
import { OsmosisQueries } from "../../queries";
import { ObservableQueryGauge } from "../../queries/incentives";
import {
  ObservableQueryPoolFeesMetrics,
  ObservableQueryActiveGauges,
} from "../../queries-external";
import { IPriceStore } from "../../price";
import { BondDuration } from "./types";
import { ObservablePoolDetails } from "./details";
import { ObservableSuperfluidPoolDetails } from "./superfluid";

/** Provides info for the current account's bonding status in a pool. */
export class ObservablePoolBonding {
  constructor(
    protected readonly poolId: string,
    protected readonly osmosisChainId: string,
    protected readonly poolDetails: ObservablePoolDetails,
    protected readonly superfluidPoolDetails: ObservableSuperfluidPoolDetails,
    protected readonly chainGetter: ChainGetter,
    protected readonly priceStore: IPriceStore,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly accountStore: IAccountStore,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>
  ) {
    makeObservable(this);
  }

  @computed
  protected get bech32Address() {
    return this.accountStore.getAccount(this.osmosisChainId).bech32Address;
  }

  @computed
  protected get queries() {
    const osmosisQueries = this.queriesStore.get(this.osmosisChainId).osmosis;
    if (!osmosisQueries) throw Error("Did not supply Osmosis chain ID");
    return osmosisQueries;
  }

  @computed
  protected get queryPool() {
    return this.queries.queryGammPools.getPool(this.poolId);
  }

  @computed
  protected get poolDetail() {
    return this.poolDetails.get(this.poolId);
  }

  @computed
  protected get superfluidPoolDetail() {
    return this.superfluidPoolDetails.get(this.poolId);
  }

  /** Calculates the stop in the bonding process the user is in.
   *
   *  1. Liquidity needs to be added
   *  2. Liquidity needs to be bonded
   */
  readonly calculateBondLevel = computedFn(
    (bondDurations: BondDuration[]): 1 | 2 | undefined => {
      if (
        this.poolDetail.userAvailableValue.toDec().gt(new Dec(0)) &&
        bondDurations.some((duration) => duration.bondable)
      )
        return 2;

      if (this.poolDetail?.userAvailableValue.toDec().isZero()) return 1;
    }
  );

  /** Gets all durations for user to bond in, or has locked tokens for,
   *  with a breakdown of the assets incentivizing the duration.
   *  Internal OSMO incentives & swap fees included in breakdown. */
  @computed
  get bondDurations(): BondDuration[] {
    const internalGauges = this.superfluidPoolDetail.gaugesWithSuperfluidApr;
    const _queryPool = this.queryPool;

    if (!_queryPool) return [];

    const queryLockedCoin = this.queries.queryAccountLocked.get(
      this.bech32Address
    );

    const externalGauges =
      this.externalQueries.queryActiveGauges.getExternalGaugesForPool(
        this.poolId
      ) ?? [];

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
          this.poolDetail.poolShareCurrency.coinMinimalDenom
        ) {
          durationsMsSet.add(coin.duration.asMilliseconds());
        }
      });

    (internalGauges as { duration: Duration }[])
      .concat(
        externalGauges.map((gauge) => ({
          duration: gauge.lockupDuration,
        }))
      )
      .forEach((gauge) => {
        durationsMsSet.add(gauge.duration.asMilliseconds());
      });

    return Array.from(durationsMsSet.values())
      .sort((a, b) => b - a)
      .reverse()
      .map((durationMs) => {
        const curDuration = dayjs.duration({
          milliseconds: durationMs,
        });
        const lockedUserShares = queryLockedCoin.getLockedCoinWithDuration(
          this.poolDetail.poolShareCurrency,
          curDuration
        ).amount;

        const userLockedShareValue = this.poolDetail.totalValueLocked.mul(
          new IntPretty(lockedUserShares.quo(_queryPool.totalShare))
        );

        /** There is only one internal gauge of a chain-configured lockable duration (1,7,14 days). */
        const internalGaugeOfDuration = internalGauges.find(
          (gauge) => gauge.duration.asMilliseconds() === durationMs
        );
        const externalGaugesOfDuration = externalGauges.reduce<
          ObservableQueryGauge[]
        >((gauges, externalGauge) => {
          if (externalGauge.lockupDuration.asMilliseconds() === durationMs) {
            gauges.push(externalGauge);
          }
          return gauges;
        }, []);

        const unlockingUserShares =
          queryLockedCoin.getUnlockingCoinWithDuration(
            this.poolDetail.poolShareCurrency,
            curDuration
          );
        const userUnlockingShares =
          unlockingUserShares.length > 0
            ? {
                // only return soonest unlocking shares
                shares:
                  unlockingUserShares[0].amount ??
                  new CoinPretty(this.poolDetail.poolShareCurrency, 0),
                endTime: unlockingUserShares[0].endTime,
              }
            : undefined;

        const incentivesBreakdown: BondDuration["incentivesBreakdown"] = [];

        // push single internal incentive for current duration
        if (internalGaugeOfDuration) {
          const { apr } = internalGaugeOfDuration;

          const fiatCurrency = this.priceStore.getFiatCurrency(
            this.priceStore.defaultVsCurrency
          );

          if (fiatCurrency) {
            const dailyPoolReward =
              this.queries.queryIncentivizedPools.computeDailyRewardForDuration(
                this.poolId,
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
        externalGaugesOfDuration.forEach((gauge) => {
          if (!gauge.gauge) return;

          for (const { remaining } of gauge.coins) {
            incentivesBreakdown.push({
              dailyPoolReward: remaining.quo(new Dec(gauge.remainingEpoch)),
              apr: this.queries.queryIncentivizedPools.computeExternalIncentiveGaugeAPR(
                this.poolId,
                gauge.gauge.id,
                remaining.currency.coinMinimalDenom,
                this.priceStore
              ),
              numDaysRemaining: gauge.remainingEpoch,
            });
          }
        });

        // add superfluid data if highest duration
        const sfsDuration = this.poolDetail.longestDuration;
        let superfluid: BondDuration["superfluid"] | undefined;
        if (
          this.superfluidPoolDetail.isSuperfluid &&
          this.superfluidPoolDetail.superfluid &&
          sfsDuration &&
          curDuration.asSeconds() === sfsDuration.asSeconds()
        ) {
          const delegation =
            (this.superfluidPoolDetail.superfluid.delegations?.length ?? 0) > 0
              ? this.superfluidPoolDetail.superfluid.delegations?.[0]
              : undefined;
          const undelegation =
            (this.superfluidPoolDetail.superfluid.undelegations?.length ?? 0) >
            0
              ? this.superfluidPoolDetail.superfluid.undelegations?.[0]
              : undefined;

          superfluid = {
            duration: sfsDuration,
            apr: this.superfluidPoolDetail.superfluidApr,
            commission: delegation?.validatorCommission,
            delegated: !this.superfluidPoolDetail.superfluid
              .upgradeableLpLockIds
              ? delegation?.amount
              : undefined,
            undelegating: !this.superfluidPoolDetail.superfluid
              .upgradeableLpLockIds
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
        const swapFeeApr =
          this.externalQueries.queryGammPoolFeeMetrics.get7dPoolFeeApr(
            _queryPool,
            this.priceStore
          );
        aggregateApr = aggregateApr.add(swapFeeApr);
        if (superfluid) aggregateApr = aggregateApr.add(superfluid.apr);

        return {
          duration: curDuration,
          bondable:
            internalGaugeOfDuration !== undefined ||
            externalGaugesOfDuration.length > 0,
          userShares: lockedUserShares,
          userLockedShareValue,
          userUnlockingShares,
          aggregateApr,
          swapFeeApr,
          swapFeeDailyReward: this.externalQueries.queryGammPoolFeeMetrics
            .getPoolFeesMetrics(this.poolId, this.priceStore)
            .feesSpent7d.quo(new Dec(7)),
          incentivesBreakdown,
          superfluid,
        };
      });
  }

  @computed
  get highestBondDuration(): BondDuration | undefined {
    return this.bondDurations.find(
      (_, i) => i === this.bondDurations.length - 1
    );
  }
}

/** Map of current accounts bonding info for all pools by pool ID. */
export class ObservablePoolsBonding extends HasMapStore<ObservablePoolBonding> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly poolDetails: ObservablePoolDetails,
    protected readonly superfluidPoolDetails: ObservableSuperfluidPoolDetails,
    protected readonly priceStore: IPriceStore,
    protected readonly chainGetter: ChainGetter,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly accountStore: IAccountStore,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>
  ) {
    super(
      (poolId) =>
        new ObservablePoolBonding(
          poolId,
          this.osmosisChainId,
          this.poolDetails,
          this.superfluidPoolDetails,
          this.chainGetter,
          this.priceStore,
          this.externalQueries,
          this.accountStore,
          this.queriesStore
        )
    );
  }

  get(poolId: string): ObservablePoolBonding {
    return super.get(poolId);
  }
}
