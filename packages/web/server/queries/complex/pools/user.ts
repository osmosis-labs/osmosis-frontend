import { CoinPretty, Dec, IntPretty, PricePretty } from "@keplr-wallet/unit";

import {
  calcSumCoinsValue,
  mapRawCoinToPretty,
} from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { getCachedPoolIncentivesMap } from "~/server/queries/complex/pools/incentives";
import { queryBalances } from "~/server/queries/cosmos";
import {
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "~/server/queries/osmosis";
import { queryAccountPositions } from "~/server/queries/osmosis/concentratedliquidity";
import {
  queryAccountLockedCoins,
  queryAccountUnlockingCoins,
} from "~/server/queries/osmosis/lockup";
import timeout from "~/utils/async";
import { aggregateRawCoinsByDenom } from "~/utils/coin";

import { getPools } from "./index";
import {
  getGammShareUnderlyingCoins,
  getSharePool,
  makeShareCoin,
} from "./share";
import { getSuperfluidPoolIds } from "./superfluid";

/** Gets info for all user pools of all types (excluding cosmwasm pools). */
export async function getUserPools(bech32Address: string) {
  const [accountPositions, poolIncentives, superfluidPoolIds] =
    await Promise.all([
      timeout(
        () => queryAccountPositions({ bech32Address }),
        10_000, // 10 seconds
        "queryCLPositions"
      )(),
      timeout(
        () => getCachedPoolIncentivesMap(),
        10_000, // 10 seconds
        "getCachedPoolIncentivesMap"
      )(),
      timeout(
        () => getSuperfluidPoolIds(),
        10_000, // 10 seconds
        "getSuperfluidPoolIds"
      )(),
    ]);

  const { locked: lockedShares, poolIds } = await getUserShareRawCoins(
    bech32Address
  );

  const userUniquePoolIds = new Set(poolIds);
  accountPositions.positions
    .map(({ position: { pool_id } }) => pool_id)
    .forEach((poolId) => userUniquePoolIds.add(poolId));

  const eventualPools = await timeout(
    () => getPools({ poolIds: Array.from(userUniquePoolIds) }),
    10_000, // 10 seconds
    "getPools"
  )();

  return await Promise.all(
    eventualPools.map(async (pool) => {
      const { id, reserveCoins, totalFiatValueLocked, type } = pool;
      let userValue: PricePretty = new PricePretty(
        DEFAULT_VS_CURRENCY,
        new Dec(0)
      );

      if (type === "concentrated") {
        const positions = accountPositions.positions.filter(
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
        const coinsToCalculateValue = await mapRawCoinToPretty(
          aggregatedRawCoins
        );

        userValue = new PricePretty(
          DEFAULT_VS_CURRENCY,
          (await calcSumCoinsValue(coinsToCalculateValue)) ?? new Dec(0)
        );
      } else if (type === "weighted" || type === "stable") {
        const totalShareAmount = new Dec(
          (
            pool.raw as WeightedPoolRawResponse | StablePoolRawResponse
          ).total_shares.amount
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
        apr: poolIncentives.get(id)?.aprBreakdown?.total,
        poolLiquidity: totalFiatValueLocked,
        isSuperfluid: superfluidPoolIds.some(
          (superfluidPoolId) => superfluidPoolId === id
        ),
        /** Note: if it's a share pool it is just locked shares value. */
        userValue,
        sharePoolInfo:
          pool.type === "weighted" || pool.type === "stable"
            ? await getSharePool(id)
            : undefined,
      };
    })
  );
}

export async function getUserSharePools(bech32Address: string) {
  const {
    available: availableRaw,
    locked: lockedRaw,
    unlocking: unlockingRaw,
    total: totalRaw,
    poolIds,
  } = await getUserShareRawCoins(bech32Address);

  const userSharePools = await getPools({ poolIds });

  const eventualUserSharePools = userSharePools.map(async (sharePool) => {
    // get aggregate of raw shares of each variation
    const available = aggregateRawCoinsByDenom(
      availableRaw.filter((coin) => coin.denom === `gamm/pool/${sharePool.id}`)
    )[0];
    const locked = aggregateRawCoinsByDenom(
      lockedRaw.filter((coin) => coin.denom === `gamm/pool/${sharePool.id}`)
    )[0];
    const unlocking = aggregateRawCoinsByDenom(
      unlockingRaw.filter((coin) => coin.denom === `gamm/pool/${sharePool.id}`)
    )[0];
    const total = aggregateRawCoinsByDenom(
      totalRaw.filter((coin) => coin.denom === `gamm/pool/${sharePool.id}`)
    )[0];

    const availableShares = makeShareCoin(available);
    const lockedShares = makeShareCoin(locked);
    const unlockingShares = makeShareCoin(unlocking);
    const totalShares = makeShareCoin(total);

    // underlying assets behind all shares
    // when catching: likely shares balance is too small for precision
    const underlyingAvailableCoins = await getGammShareUnderlyingCoins(
      available
    ).catch(() => [] as CoinPretty[]);
    const underlyingLockedCoins = await getGammShareUnderlyingCoins(
      locked
    ).catch(() => [] as CoinPretty[]);
    const underlyingUnlockingCoins = await getGammShareUnderlyingCoins(
      unlocking
    ).catch(() => [] as CoinPretty[]);
    const totalCoins = await getGammShareUnderlyingCoins(total).catch(
      () => [] as CoinPretty[]
    );

    // value of all shares
    const availableValue = await calcSumCoinsValue(underlyingAvailableCoins);
    const lockedValue = await calcSumCoinsValue(underlyingLockedCoins);
    const unlockingValue = await calcSumCoinsValue(underlyingUnlockingCoins);
    const totalValue = await calcSumCoinsValue(totalCoins);

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
      availableValue,

      lockedShares,
      underlyingLockedCoins,
      lockedValue,

      unlockingShares,
      underlyingUnlockingCoins,
      unlockingValue,

      totalShares,
      totalCoins,
      totalValue,
    };
  });

  // needed per pool
  // - user total coinpretty and value
  // - user available coinpretty and value
  // - user locked coinpretty and value
  // - user unlocking coinpretty and value

  return Promise.all(eventualUserSharePools);
}

async function getUserShareRawCoins(bech32Address: string) {
  const [userBalances, lockedCoins, unlockingCoins] = await Promise.all([
    timeout(
      () => queryBalances({ bech32Address }),
      10_000, // 10 seconds
      "queryBalances"
    )(),
    timeout(
      () =>
        queryAccountLockedCoins({
          bech32Address,
        }),
      10_000, // 10 seconds
      "queryAccountLockedCoins"
    )(),
    timeout(
      () =>
        queryAccountUnlockingCoins({
          bech32Address,
        }),
      10_000, // 10 seconds
      "queryAccountUnlockingCoins"
    )(),
  ]);

  const available = userBalances.balances.filter(
    ({ denom }) => denom && denom.startsWith("gamm/pool/")
  );
  const locked = lockedCoins.coins.filter(
    ({ denom }) => denom && denom.startsWith("gamm/pool/")
  );
  const unlocking = unlockingCoins.coins.filter(
    ({ denom }) => denom && denom.startsWith("gamm/pool/")
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
