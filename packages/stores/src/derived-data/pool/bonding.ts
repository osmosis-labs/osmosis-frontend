import {
  CoinPretty,
  Dec,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import {
  ChainGetter,
  HasMapStore,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { AccountStore } from "../../account";
import { IPriceStore } from "../../price";
import { OsmosisQueries } from "../../queries";
import { ObservableQueryGauge } from "../../queries/incentives";
import {
  ObservableQueryActiveGauges,
  ObservableQueryPoolAprs,
  ObservableQueryPoolFeesMetrics,
} from "../../queries-external";
import { ObservableSharePoolDetails } from "./share-pool-details";
import { ObservableSuperfluidPoolDetails } from "./superfluid";
import { BondDuration } from "./types";

/** Provides info for the current account's bonding status in a pool. */
export class ObservableSharePoolBonding {
  constructor(
    protected readonly poolId: string,
    protected readonly osmosisChainId: string,
    protected readonly sharePoolDetails: ObservableSharePoolDetails,
    protected readonly superfluidPoolDetails: ObservableSuperfluidPoolDetails,
    protected readonly chainGetter: ChainGetter,
    protected readonly priceStore: IPriceStore,
    protected readonly externalQueries: {
      queryPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
      queryPoolAprs: ObservableQueryPoolAprs;
    },
    protected readonly accountStore: AccountStore,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>
  ) {
    makeObservable(this);
  }

  protected get bech32Address() {
    return this.accountStore.getWallet(this.osmosisChainId)?.address ?? "";
  }

  @computed
  protected get queries() {
    const osmosisQueries = this.queriesStore.get(this.osmosisChainId).osmosis;
    if (!osmosisQueries) throw Error("Did not supply Osmosis chain ID");
    return osmosisQueries;
  }

  @computed
  protected get querySharePool() {
    const pool = this.queries.queryPools.getPool(this.poolId);

    if (Boolean(pool?.sharePool)) return pool;
  }

  /** Information about share pools. */
  protected get sharePoolDetail() {
    return this.sharePoolDetails.get(this.poolId);
  }

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
        this.sharePoolDetail.userAvailableShares.toDec().gt(new Dec(0)) &&
        bondDurations.some((duration) => duration.bondable)
      )
        return 2;

      if (this.sharePoolDetail.userAvailableShares.toDec().isZero()) return 1;
    }
  );

  /** Gets all durations for user to bond in, or has locked tokens for,
   *  with a breakdown of the assets incentivizing the duration.
   *  Internal OSMO incentives & swap fees included in breakdown. */
  @computed
  get bondDurations(): BondDuration[] {
    if (!this.querySharePool) return [];

    const internalGauges = this.superfluidPoolDetail.gaugesWithSuperfluidApr;

    const queryLockedCoin = this.queries.queryAccountLocked.get(
      this.bech32Address
    );

    const externalGauges =
      this.externalQueries.queryActiveGauges.getExternalGaugesForPool(
        this.poolId
      );

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
          this.sharePoolDetail.poolShareCurrency.coinMinimalDenom
        ) {
          durationsMsSet.add(coin.duration.asMilliseconds());
        }
      });

    // add the duration for all the internal & external gauges
    (internalGauges as { duration: Duration }[])
      .concat(
        externalGauges.map((gauge) => ({
          duration: gauge.lockupDuration,
        }))
      )
      .forEach((gauge) => {
        durationsMsSet.add(gauge.duration.asMilliseconds());
      });

    // add longest duration if superfluid
    if (this.superfluidPoolDetail.isSuperfluid) {
      const longestDuration = this.sharePoolDetail.longestDuration;
      if (longestDuration) {
        durationsMsSet.add(longestDuration.asMilliseconds());
      }
    }

    // now find the bond duration info for each relevant duration
    return Array.from(durationsMsSet.values())
      .sort((a, b) => a - b)
      .map((durationMs) => this.getBondDuration(durationMs))
      .filter((duration): duration is BondDuration => duration !== undefined);
  }

  /** Highest APR that can be earned in this share pool. */
  get highestBondDuration(): BondDuration | undefined {
    if (!this.sharePoolDetail.longestDuration) return;

    return this.getBondDuration(
      this.sharePoolDetail.longestDuration.asMilliseconds()
    );
  }

  /** Memoizes calculation of bond duration data per duration in ms */
  protected readonly getBondDuration = computedFn(
    (durationMs: number): BondDuration | undefined => {
      const externalGauges =
        this.externalQueries.queryActiveGauges.getExternalGaugesForPool(
          this.poolId
        );

      const queryLockedCoin = this.queries.queryAccountLocked.get(
        this.bech32Address
      );

      const _queryPool = this.querySharePool;
      if (!_queryPool) return;

      const curDuration = dayjs.duration({
        milliseconds: durationMs,
      });

      const isHighestDuration =
        curDuration.asMilliseconds() ===
        this.sharePoolDetail.longestDuration?.asMilliseconds();

      const lockedUserShares = queryLockedCoin.getLockedCoinWithDuration(
        this.sharePoolDetail.poolShareCurrency,
        curDuration
      ).amount;

      const userLockedShareValue = _queryPool.totalShare.toDec().isPositive()
        ? this.sharePoolDetail.totalValueLocked.mul(
            new IntPretty(lockedUserShares.quo(_queryPool.totalShare))
          )
        : new PricePretty(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)!,
            new Dec(0)
          );

      /** There is only one internal gauge of a chain-configured lockable duration (1,7,14 days). */
      const externalGaugesOfDuration = externalGauges.reduce<
        ObservableQueryGauge[]
      >((gauges, externalGauge) => {
        if (externalGauge.lockupDuration.asMilliseconds() === durationMs) {
          gauges.push(externalGauge);
        }
        return gauges;
      }, []);

      const unlockingUserShares = queryLockedCoin.getUnlockingCoinWithDuration(
        this.sharePoolDetail.poolShareCurrency,
        curDuration
      );
      const userUnlockingShares =
        unlockingUserShares.length > 0
          ? {
              // only return soonest unlocking shares
              shares:
                unlockingUserShares[0].amount ??
                new CoinPretty(this.sharePoolDetail.poolShareCurrency, 0),
              endTime: unlockingUserShares[0].endTime,
            }
          : undefined;

      // one of the following must hold:
      if (
        !(
          // are external incentives
          (
            externalGaugesOfDuration.length > 0 ||
            // is internally incentivized
            this.sharePoolDetail.isIncentivized ||
            // is superfluid and is the longest duration
            (this.superfluidPoolDetail.isSuperfluid &&
              curDuration.asMilliseconds() ===
                this.sharePoolDetail.longestDuration?.asMilliseconds()) ||
            // this duration has duration locks containing locked shares
            lockedUserShares.toDec().isPositive() ||
            // same as above but for unlocking shares
            (userUnlockingShares &&
              userUnlockingShares.shares.toDec().isPositive())
          )
        )
      ) {
        // if none of the above apply, return undefined
        return;
      }

      const incentivesBreakdown: BondDuration["incentivesBreakdown"] = [];

      const queryPoolAprs = this.externalQueries.queryPoolAprs.getForPool(
        this.poolId
      );

      // push single internal incentive for current duration
      if (queryPoolAprs?.osmosis) {
        incentivesBreakdown.push({
          apr: queryPoolAprs.osmosis,
          type: "osmosis",
        });
      }

      // push external incentives to current duration (called "boost")
      if (queryPoolAprs?.boost) {
        incentivesBreakdown.push({
          apr: queryPoolAprs.boost,
          type: "boost",
        });
      }

      // add superfluid data if highest duration
      const sfsDuration = this.sharePoolDetail.longestDuration;
      let superfluid: BondDuration["superfluid"] | undefined;
      const isSuperfluidDuration = Boolean(
        this.superfluidPoolDetail.isSuperfluid &&
          sfsDuration &&
          curDuration.asSeconds() === sfsDuration.asSeconds()
      );
      if (isSuperfluidDuration && sfsDuration) {
        const delegation =
          (this.superfluidPoolDetail.userSharesDelegations?.length ?? 0) > 0
            ? this.superfluidPoolDetail.userSharesDelegations?.[0]
            : undefined;
        const undelegation =
          (this.superfluidPoolDetail.userSharesUndelegations?.length ?? 0) > 0
            ? this.superfluidPoolDetail.userSharesUndelegations?.[0]
            : undefined;

        superfluid = {
          duration: sfsDuration,
          apr: queryPoolAprs?.superfluid ?? new RatePretty(0),
          commission: delegation?.validatorCommission,
          delegated: !this.superfluidPoolDetail.userUpgradeableSharePoolLockIds
            ? delegation?.equivalentOsmoAmount
            : undefined,
          undelegating: !this.superfluidPoolDetail
            .userUpgradeableSharePoolLockIds
            ? undelegation?.amount
            : undefined,
          validatorMoniker: delegation?.validatorName,
          validatorLogoUrl: delegation?.validatorImgSrc,
        };
      }

      const aggregateApr = queryPoolAprs?.totalApr ?? new RatePretty(0);

      return {
        duration: curDuration,
        bondable: isHighestDuration,
        userShares: lockedUserShares,
        userLockedShareValue,
        userUnlockingShares,
        aggregateApr,
        swapFeeApr: this.sharePoolDetail.swapFeeApr,
        incentivesBreakdown,
        superfluid,
      };
    }
  );
}

/** Map of current accounts bonding info for all pools by pool ID. */
export class ObservablePoolsBonding extends HasMapStore<ObservableSharePoolBonding> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly poolDetails: ObservableSharePoolDetails,
    protected readonly superfluidPoolDetails: ObservableSuperfluidPoolDetails,
    protected readonly priceStore: IPriceStore,
    protected readonly chainGetter: ChainGetter,
    protected readonly externalQueries: {
      queryPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
      queryPoolAprs: ObservableQueryPoolAprs;
    },
    protected readonly accountStore: AccountStore,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>
  ) {
    super(
      (poolId) =>
        new ObservableSharePoolBonding(
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

  get(poolId: string): ObservableSharePoolBonding {
    return super.get(poolId);
  }
}
