import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import type { Duration } from "dayjs/plugin/duration";

import dayjs from "../../../utils/dayjs";
import { captureErrorAndReturn } from "../../../utils/error";
import { querySyntheticLockupsByLockId } from "../../osmosis/lockup";
import {
  querySuperfluidDelegations,
  querySuperfluidUnelegations,
} from "../../osmosis/superfluid";
import { calcSumCoinsValue } from "../assets";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
import { getUserLocks } from "../osmosis";
import { getValidatorInfo } from "../staking/validator";
import {
  getActiveGauges,
  getCachedPoolIncentivesMap,
  getIncentivizedPools,
  getLockableDurations,
} from "./incentives";
import {
  getGammShareUnderlyingCoins,
  getShareDenomPoolId,
  makeGammShareCurrency,
} from "./share";
import { getSuperfluidPoolIds } from "./superfluid";

export type UserDurationSuperfluidDelegation = {
  delegated?: CoinPretty;
  undelegating?: CoinPretty;

  // validator info
  commission?: RatePretty;
  validatorMoniker?: string;
  validatorLogoUrl?: string;
};

/** Bond duration that corresponds to locked pool shares. */
export type BondDuration = {
  duration: Duration;
  /** Bondable if there's any active gauges for this duration. */
  bondable: boolean;
  /** User locked shares. */
  userShares: CoinPretty;
  userLockedShareValue: PricePretty;
  userLocks: {
    lockId: string;
    /** AKA is superfluid lock */
    isSynthetic: boolean;
  }[];
  userUnlockingShares?: { shares: CoinPretty; endTime?: Date };
  aggregateApr: RatePretty;
  swapFeeApr: RatePretty;
  incentivesBreakdown: {
    apr: RatePretty;
    type: "osmosis" | "boost";
  }[];
  /** Both `delegated` and `undelegating` will be `undefined` if the user may "Go superfluid". */
  superfluid?: {
    /** Duration users can bond to for superfluid participation. Assumed to be longest duration on lock durations chain param. */
    duration: Duration;
    apr: RatePretty;
  } & UserDurationSuperfluidDelegation;
};

export async function getSharePoolBondDurations({
  poolId,
  bech32Address,
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  poolId: string;
  bech32Address?: string;
}): Promise<BondDuration[]> {
  const activeGaugesPromise = getActiveGauges(params).then((activeGauges) =>
    activeGauges.filter(
      (gauge) =>
        gauge.distribute_to.lock_query_type === "ByDuration" &&
        getShareDenomPoolId(gauge.distribute_to.denom) === poolId
    )
  );
  const poolIncentivesPromise = getCachedPoolIncentivesMap().then((map) =>
    map.get(poolId)
  );
  const isSuperfluidPromise = getSuperfluidPoolIds(params).then((ids) =>
    ids.includes(poolId)
  );
  const longestDurationPromise = getLockableDurations(params).then(
    (durations) => durations[durations.length - 1]
  );
  const internalIncentivesPromise = getIncentivizedPools(params).then(
    (incentivizedPools) => incentivizedPools.find((p) => p.pool_id === poolId)
  );
  const userPoolLocksPromise = bech32Address
    ? getUserLocks({ ...params, bech32Address }).then((locks) =>
        locks.filter((userLock) =>
          userLock.coins.some(
            (coin) => getShareDenomPoolId(coin.denom) === poolId
          )
        )
      )
    : Promise.resolve([]);

  const [
    poolGauges,
    poolIncentives,
    isSuperfluid,
    longestDuration,
    internalIncentives,
    userPoolLocks,
  ] = await Promise.all([
    activeGaugesPromise,
    poolIncentivesPromise,
    isSuperfluidPromise,
    longestDurationPromise,
    internalIncentivesPromise,
    userPoolLocksPromise,
  ]);

  /** Set of all available durations. */
  const durationsMsSet = new Set<number>();

  // internal gauges
  if (internalIncentives) {
    durationsMsSet.add(internalIncentives.lockable_duration.asMilliseconds());
  }

  // external gauges
  poolGauges.forEach((gauge) => {
    durationsMsSet.add(gauge.distribute_to.duration.asMilliseconds());
  });

  // user locks
  userPoolLocks.forEach((userLock) => {
    durationsMsSet.add(userLock.duration.asMilliseconds());
  });

  // superfluid incentives
  if (isSuperfluid) durationsMsSet.add(longestDuration.asMilliseconds());

  return await Promise.all(
    Array.from(durationsMsSet)
      .sort((a, b) => a - b)
      .map(async (durationMs) => {
        const isLongestDuration =
          durationMs === longestDuration.asMilliseconds();
        const isSuperfluidDuration = isSuperfluid && isLongestDuration;
        const durationGauges = poolGauges.filter(
          (gauge) =>
            gauge.distribute_to.duration.asMilliseconds() === durationMs
        );
        const userDurationLocks = userPoolLocks.filter(
          (userLock) => userLock.duration.asMilliseconds() === durationMs
        );

        // get user locked shares
        let userShares: CoinPretty = new CoinPretty(
          makeGammShareCurrency(poolId),
          0
        );
        const userLockedLockIds: string[] = [];
        const userLockedLocks = userDurationLocks.filter(
          (userLock) => !userLock.isCurrentlyUnlocking
        );
        if (userLockedLocks.length) {
          userLockedLocks.forEach((userDurationLock) => {
            userDurationLock.coins.forEach((coin) => {
              if (getShareDenomPoolId(coin.denom) === poolId) {
                userShares = userShares.add(
                  new CoinPretty(userShares.currency, coin.amount)
                );
              }
            });
            userLockedLockIds.push(userDurationLock.ID);
          });
        }
        let userLockedShareValue = new PricePretty(DEFAULT_VS_CURRENCY, 0);
        if (userShares.toDec().isPositive()) {
          const underlyingCoins = await getGammShareUnderlyingCoins({
            ...params,
            ...userShares.toCoin(),
          }).catch((e) => captureErrorAndReturn(e, []));
          const userSharesValue = await calcSumCoinsValue({
            ...params,
            coins: underlyingCoins,
          });
          if (userSharesValue) {
            userLockedShareValue = new PricePretty(
              DEFAULT_VS_CURRENCY,
              userSharesValue
            );
          }
        }

        // get user unlocking shares
        let userUnlockingShares:
          | { shares: CoinPretty; endTime?: Date }
          | undefined = undefined;
        const userUnlockingLocks = userDurationLocks
          .filter((userLock) => userLock.isCurrentlyUnlocking)
          .sort((a, b) => (a.endTime > b.endTime ? 1 : -1));

        if (userUnlockingLocks.length) {
          // get most recent lock to unlock
          const mostRecentUnlock = userUnlockingLocks[0];
          userUnlockingShares = {
            shares: new CoinPretty(
              makeGammShareCurrency(poolId),
              // should just contain shares, but still find them
              mostRecentUnlock.coins.find(
                (coin) => getShareDenomPoolId(coin.denom) === poolId
              )?.amount ?? "0"
            ),
            endTime: mostRecentUnlock.endTime,
          };
        }

        // get incentives APRs
        const incentivesBreakdown: BondDuration["incentivesBreakdown"] = [];
        if (isLongestDuration) {
          // internal mint incentives
          if (poolIncentives?.aprBreakdown?.osmosis) {
            incentivesBreakdown.push({
              apr: poolIncentives?.aprBreakdown?.osmosis,
              type: "osmosis",
            });
          }
          // external incentives
          if (poolIncentives?.aprBreakdown?.boost) {
            incentivesBreakdown.push({
              apr: poolIncentives?.aprBreakdown?.boost,
              type: "boost",
            });
          }
        }
        let aggregateApr = incentivesBreakdown.reduce(
          (sum, { apr }) => sum.add(apr),
          new RatePretty(0)
        );
        const swapFeeApr =
          poolIncentives?.aprBreakdown?.swapFee ?? new RatePretty(0);
        aggregateApr = aggregateApr.add(swapFeeApr);

        // get superfluid info for this duration
        let superfluid: BondDuration["superfluid"] | undefined = undefined;
        const userSyntheticLockIds: string[] = [];
        if (isSuperfluidDuration) {
          const superfluidApr =
            poolIncentives?.aprBreakdown?.superfluid ?? new RatePretty(0);
          aggregateApr = aggregateApr.add(superfluidApr);

          const userDelegations = bech32Address
            ? await querySuperfluidDelegations({ ...params, bech32Address })
            : undefined;
          const userPoolDelegation =
            userDelegations?.superfluid_delegation_records.find(
              ({ delegation_amount }) =>
                getShareDenomPoolId(delegation_amount.denom) === poolId
            );
          const userUndelegations =
            bech32Address && !userPoolDelegation
              ? await querySuperfluidUnelegations({ ...params, bech32Address })
              : undefined;
          const userPoolUndelegation =
            userUndelegations?.superfluid_delegation_records.find(
              ({ delegation_amount }) =>
                getShareDenomPoolId(delegation_amount.denom) === poolId
            );

          // record locks that are synthetic (superfluid)
          userUndelegations?.synthetic_locks.forEach((lock) => {
            const poolIdFromDenom = lock.synth_denom.split("/")[2];
            if (poolIdFromDenom === poolId) {
              userSyntheticLockIds.push(lock.underlying_lock_id);
            }
          });

          if (userPoolDelegation || userPoolUndelegation) {
            const validatorAddress =
              userPoolDelegation?.validator_address ??
              userPoolUndelegation?.validator_address;
            const validatorInfo = validatorAddress
              ? await getValidatorInfo({
                  ...params,
                  validatorBech32Address: validatorAddress,
                })
              : undefined;

            superfluid = {
              duration: longestDuration,
              apr: superfluidApr,
              delegated: userPoolDelegation
                ? new CoinPretty(
                    makeGammShareCurrency(poolId),
                    userPoolDelegation.delegation_amount.amount
                  )
                : undefined,
              undelegating: userPoolUndelegation
                ? new CoinPretty(
                    makeGammShareCurrency(poolId),
                    userPoolUndelegation.delegation_amount.amount
                  )
                : undefined,
              commission: validatorInfo?.validatorCommission,
              validatorLogoUrl: validatorInfo?.validatorImgSrc,
              validatorMoniker: validatorInfo?.validatorName,
            };
          } else {
            superfluid = {
              duration: longestDuration,
              apr: superfluidApr,
            };
          }
        }

        // for locks we don't know are synthetic, query to find out
        const queryableLockIds = userLockedLockIds.filter(
          (lockId) => !userSyntheticLockIds.includes(lockId)
        );
        const syntheticLocks = await Promise.all(
          queryableLockIds.map((lockId) =>
            querySyntheticLockupsByLockId({ ...params, lockId })
          )
        );
        syntheticLocks.forEach(({ synthetic_locks }) => {
          if (
            synthetic_locks.length &&
            synthetic_locks[0].synth_denom.split("/")[2] === poolId
          ) {
            userSyntheticLockIds.push(synthetic_locks[0].underlying_lock_id);
          }
        });

        return {
          duration: dayjs.duration(durationMs),
          bondable: isSuperfluid ? isLongestDuration : Boolean(durationGauges),
          userShares,
          userLockedShareValue,
          userLocks: userLockedLockIds.map((lockId) => ({
            lockId,
            isSynthetic: userSyntheticLockIds.includes(lockId),
          })),
          userUnlockingShares,
          aggregateApr,
          swapFeeApr,
          incentivesBreakdown,
          superfluid,
        };
      })
  );
}
