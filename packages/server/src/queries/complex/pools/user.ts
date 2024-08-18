import { Dec, IntPretty, PricePretty } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import { aggregateRawCoinsByDenom, timeout } from "@osmosis-labs/utils";

import {
  calcSumCoinsValue,
  mapRawCoinToPretty,
} from "../../../queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "../../../queries/complex/assets/config";
import {
  getCachedPoolIncentivesMap,
  PoolIncentives,
} from "../../../queries/complex/pools/incentives";
import { queryBalances } from "../../../queries/cosmos";
import {
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "../../../queries/osmosis";
import {
  LiquidityPosition,
  queryAccountPositions,
} from "../../../queries/osmosis/concentratedliquidity";
import { getUserLocks } from "../osmosis/lockup";
import { getPools } from "./index";
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
      timeout(
        () =>
          getCachedPoolIncentivesMap().catch(
            () => new Map<string, PoolIncentives>()
          ),
        10_000, // 10 seconds
        "getCachedPoolIncentivesMap"
      )().catch(() => new Map<string, PoolIncentives>()),
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

  const eventualPools = await timeout(
    () => getPools({ ...params, poolIds: Array.from(userUniquePoolIds) }),
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

        userValue = new PricePretty(
          DEFAULT_VS_CURRENCY,
          await calcSumCoinsValue({ ...params, coins: coinsToCalculateValue })
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
      };
    })
  );
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
