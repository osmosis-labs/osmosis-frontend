import type {
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "@osmosis-labs/types";
import { AssetList, Chain } from "@osmosis-labs/types";
import { Dec, IntPretty, PricePretty, RatePretty } from "@osmosis-labs/unit";
import { aggregateRawCoinsByDenom, timeout } from "@osmosis-labs/utils";

import {
  calcSumCoinsValueOrUnknown,
  mapRawCoinToPretty,
} from "../../../queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "../../../queries/complex/assets/config";
import { getCachedPoolIncentivesMap } from "../../../queries/complex/pools/incentives";
import { queryBalances } from "../../../queries/cosmos";
import {
  LiquidityPosition,
  queryAccountPositions,
} from "../../../queries/osmosis/concentratedliquidity";
import { captureErrorAndReturn } from "../../../utils/error";
import { getUserLocks } from "../osmosis/lockup";
import { getPools } from "./index";
import { getGammShareUnderlyingCoins, makeShareCoin } from "./share";
import { getSuperfluidPoolIds } from "./superfluid";

/** Gets info for all user pools of all types (excluding cosmwasm pools). */
export async function getUserPools(params: {
  assetLists: AssetList[];
  chainList: Chain[];
  bech32Address: string;
}) {
  const { assetLists } = params;

  const [accountPositions, poolIncentives, superfluidPoolIds] =
    await Promise.all([
      timeout(
        () =>
          queryAccountPositions(params)
            .then(({ positions }) => positions)
            .catch(() => [] as LiquidityPosition[]),
        10_000, // 10 seconds
        "queryCLPositions"
      )().catch(() => [] as LiquidityPosition[]),
      // Undefined when the APRs are unavailable, so they aren't shown as 0%.
      timeout(
        () => getCachedPoolIncentivesMap().catch(() => undefined),
        10_000, // 10 seconds
        "getCachedPoolIncentivesMap"
      )().catch(() => undefined),
      timeout(
        () => getSuperfluidPoolIds(params).catch(() => [] as string[]),
        10_000, // 10 seconds
        "getSuperfluidPoolIds"
      )().catch(() => [] as string[]),
    ]);

  const { locked: lockedShares, poolIds } = await getUserShareRawCoins(params);

  const userUniquePoolIds = new Set(poolIds);
  accountPositions
    .map(({ position: { pool_id } }) => pool_id)
    .forEach((poolId) => userUniquePoolIds.add(poolId));

  const pools = await getPools({
    ...params,
    poolIds: Array.from(userUniquePoolIds),
  });

  return await Promise.all(
    pools.items?.map(async (pool) => {
      const { id, reserveCoins, totalFiatValueLocked, type, tvlUnknown } = pool;
      let userValue: PricePretty = new PricePretty(
        DEFAULT_VS_CURRENCY,
        new Dec(0)
      );
      // Set when a price behind the user's value is unavailable, so the value isn't
      // understated (or hidden as dust) as if the funds were missing.
      let userValueUnknown = false;

      if (type === "concentrated") {
        const positions = accountPositions.filter(
          ({ position: { pool_id } }) => pool_id === id
        );

        if (positions.length === 0) {
          throw new Error(
            `Positions for pool id ${id} not found. It should exist if the pool id is available in the userPoolIds set.`
          );
        }

        const aggregatedRawCoins = aggregateRawCoinsByDenom(
          positions.flatMap(({ asset0, asset1 }) => [asset0, asset1])
        );
        const coinsToCalculateValue = mapRawCoinToPretty(
          assetLists,
          aggregatedRawCoins
        );

        const value = await calcSumCoinsValueOrUnknown({
          ...params,
          coins: coinsToCalculateValue,
        });
        userValueUnknown = value === undefined;
        userValue = new PricePretty(DEFAULT_VS_CURRENCY, value ?? new Dec(0));
      } else if (type === "weighted" || type === "stable") {
        const totalShareAmount = new Dec(
          (pool.raw as WeightedPoolRawResponse | StablePoolRawResponse)
            .total_shares.amount
        );
        const rawShare = aggregateRawCoinsByDenom(
          lockedShares
            .filter((coin) => coin.denom === `gamm/pool/${id}`)
            .concat()
        )[0];

        if (rawShare) {
          const userValueAmount = totalShareAmount.isZero()
            ? new Dec(0)
            : totalFiatValueLocked
                .mul(
                  new IntPretty(new Dec(rawShare.amount).quo(totalShareAmount))
                )
                .trim(true);

          userValue = new PricePretty(DEFAULT_VS_CURRENCY, userValueAmount);
        }
      }

      return {
        id,
        type,
        reserveCoins,
        // A pool missing from a loaded map has no APR; an unavailable map means unknown.
        apr: poolIncentives
          ? (poolIncentives.get(id)?.aprBreakdown?.total ?? {
              lower: new RatePretty(0),
              upper: new RatePretty(0),
            })
          : undefined,
        // Undefined when a reserve has no price: the TVL is unknown, not the partial sum.
        poolLiquidity: tvlUnknown ? undefined : totalFiatValueLocked,
        /** True when the user's value can't be priced: a coin's price or the pool TVL is unavailable. */
        userValueUnknown:
          userValueUnknown ||
          Boolean(tvlUnknown && (type === "weighted" || type === "stable")),
        isSuperfluid: superfluidPoolIds.some(
          (superfluidPoolId) => superfluidPoolId === id
        ),
        /** Note: if it's a share pool it is just locked shares value. */
        userValue,
      };
    })
  );
}

export async function getUserSharePools(params: {
  assetLists: AssetList[];
  chainList: Chain[];
  bech32Address: string;
  poolIds?: string[];
}) {
  const [userRawCoins, userLocks, specifiedPools] = await Promise.all([
    getUserShareRawCoins(params),
    getUserLocks(params),
    params.poolIds ? getPools(params) : null,
  ]);

  const {
    available: availableRaw,
    locked: lockedRaw,
    unlocking: unlockingRaw,
    total: totalRaw,
    poolIds: ownedPoolIds,
  } = userRawCoins;

  const userSharePools =
    specifiedPools ?? (await getPools({ ...params, poolIds: ownedPoolIds }));

  const eventualUserSharePools = userSharePools.items.map(async (sharePool) => {
    // get aggregate of raw shares of each variation
    const available = availableRaw.length
      ? aggregateRawCoinsByDenom(
          availableRaw.filter(
            (coin) => coin.denom === `gamm/pool/${sharePool.id}`
          )
        )[0]
      : null;
    const locked = lockedRaw.length
      ? aggregateRawCoinsByDenom(
          lockedRaw.filter((coin) => coin.denom === `gamm/pool/${sharePool.id}`)
        )[0]
      : null;
    const unlocking = unlockingRaw.length
      ? aggregateRawCoinsByDenom(
          unlockingRaw.filter(
            (coin) => coin.denom === `gamm/pool/${sharePool.id}`
          )
        )[0]
      : null;
    const total = totalRaw.length
      ? aggregateRawCoinsByDenom(
          totalRaw.filter((coin) => coin.denom === `gamm/pool/${sharePool.id}`)
        )[0]
      : null;

    const availableShares = available ? makeShareCoin(available) : null;
    const lockedShares = locked ? makeShareCoin(locked) : null;
    const unlockingShares = unlocking ? makeShareCoin(unlocking) : null;
    const totalShares = total ? makeShareCoin(total) : null;

    // underlying assets behind all shares
    // when catching: likely shares balance is too small for precision
    const [
      underlyingAvailableCoins,
      underlyingLockedCoins,
      underlyingUnlockingCoins,
      totalCoins,
    ] = await Promise.all([
      available
        ? getGammShareUnderlyingCoins({ ...params, ...available }).catch((e) =>
            captureErrorAndReturn(e, [])
          )
        : Promise.resolve([]),
      locked
        ? getGammShareUnderlyingCoins({ ...params, ...locked }).catch((e) =>
            captureErrorAndReturn(e, [])
          )
        : Promise.resolve([]),
      unlocking
        ? getGammShareUnderlyingCoins({ ...params, ...unlocking }).catch((e) =>
            captureErrorAndReturn(e, [])
          )
        : Promise.resolve([]),
      total
        ? getGammShareUnderlyingCoins({ ...params, ...total }).catch((e) =>
            captureErrorAndReturn(e, [])
          )
        : Promise.resolve([]),
    ]);

    // value of all shares; undefined when a coin that should have a price has none
    const [availableValue, lockedValue, unlockingValue, totalValue] =
      await Promise.all([
        calcSumCoinsValueOrUnknown({
          ...params,
          coins: underlyingAvailableCoins,
        }),
        calcSumCoinsValueOrUnknown({
          ...params,
          coins: underlyingLockedCoins,
        }),
        calcSumCoinsValueOrUnknown({
          ...params,
          coins: underlyingUnlockingCoins,
        }),
        calcSumCoinsValueOrUnknown({
          ...params,
          coins: totalCoins,
        }),
      ]);
    const valueUnknown = [
      availableValue,
      lockedValue,
      unlockingValue,
      totalValue,
    ].some((value) => value === undefined);

    // get locks containing this pool's shares
    const lockedLocks = userLocks.filter(
      ({ coins, isCurrentlyUnlocking }) =>
        coins.some((coin) => coin.denom === `gamm/pool/${sharePool.id}`) &&
        !isCurrentlyUnlocking
    );
    const unlockingLocks = userLocks.filter(
      ({ coins, isCurrentlyUnlocking }) =>
        coins.some((coin) => coin.denom === `gamm/pool/${sharePool.id}`) &&
        isCurrentlyUnlocking
    );

    return {
      // pool
      ...sharePool,
      // narrow the type
      type: sharePool.type as "weighted" | "stable",
      raw: sharePool.raw as Omit<
        WeightedPoolRawResponse | StablePoolRawResponse,
        "@type"
      >,

      // user data
      availableShares,
      underlyingAvailableCoins,
      availableValue: new PricePretty(DEFAULT_VS_CURRENCY, availableValue ?? 0),

      lockedShares,
      underlyingLockedCoins,
      lockedLocks,
      lockedValue: new PricePretty(DEFAULT_VS_CURRENCY, lockedValue ?? 0),

      unlockingShares,
      unlockingLocks,
      underlyingUnlockingCoins,
      unlockingValue: new PricePretty(DEFAULT_VS_CURRENCY, unlockingValue ?? 0),

      totalShares,
      totalCoins,
      totalValue: new PricePretty(DEFAULT_VS_CURRENCY, totalValue ?? 0),
      /** True when a share value couldn't be priced; the values above are then unknown. */
      valueUnknown,
    };
  });

  // needed per pool
  // - user total coinpretty and value
  // - user available coinpretty and value
  // - user locked coinpretty and value
  // - user unlocking coinpretty and value

  return Promise.all(eventualUserSharePools);
}

async function getUserShareRawCoins(params: {
  chainList: Chain[];
  bech32Address: string;
}) {
  const [userBalances, userLocks] = await Promise.all([
    queryBalances(params),
    getUserLocks(params),
  ]);

  const available = userBalances.balances.filter(
    ({ denom }) => denom && denom.startsWith("gamm/pool/")
  );
  const locked = userLocks
    .filter((userLock) => !userLock.isCurrentlyUnlocking)
    .filter((userLock) =>
      userLock.coins.some((coin) => coin.denom.startsWith("gamm/pool"))
    )
    .flatMap((lock) =>
      lock.coins.filter((coin) => coin.denom.startsWith("gamm/pool"))
    );
  const unlocking = userLocks
    .filter((userLock) => userLock.isCurrentlyUnlocking)
    .filter((userLock) =>
      userLock.coins.some((coin) => coin.denom.startsWith("gamm/pool"))
    )
    .flatMap((lock) =>
      lock.coins.filter((coin) => coin.denom.startsWith("gamm/pool"))
    );

  const total = [...available, ...locked, ...unlocking];
  const poolIds = new Set<string>();
  total.forEach(({ denom }) => {
    const poolId = denom.replace("gamm/pool/", "");
    poolIds.add(poolId);
  });

  return {
    available,
    locked,
    unlocking,
    /** Unaggregated total of all share balances. */
    total: [...available, ...locked, ...unlocking],
    poolIds: Array.from(poolIds),
  };
}
