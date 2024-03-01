import { Dec, IntPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";

import {
  calcSumCoinsValue,
  mapRawCoinToPretty,
} from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { getCachedPoolIncentivesMap } from "~/server/queries/complex/pools/incentives";
import { queryBalances } from "~/server/queries/cosmos";
import { WeightedPoolRawResponse } from "~/server/queries/osmosis";
import { queryAccountPositions } from "~/server/queries/osmosis/concentratedliquidity";
import {
  queryAccountLockedCoins,
  queryAccountUnlockingCoins,
} from "~/server/queries/osmosis/lockup";
import timeout from "~/utils/async";
import { aggregateRawCoinsByDenom } from "~/utils/coin";

import { getPools } from "./index";
import { getSuperfluidPoolIds } from "./superfluid";

export async function getUserPools(bech32Address: string) {
  const [
    userBalances,
    lockedCoins,
    unlockingCoins,
    accountPositions,
    poolIncentives,
    superfluidPools,
  ] = await Promise.all([
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

  const gammAssets = [
    ...userBalances.balances,
    ...lockedCoins.coins,
    ...unlockingCoins.coins,
  ].filter(({ denom }) => denom && denom.startsWith("gamm/pool/"));

  const userPoolIdsSet: Set<string> = new Set(
    accountPositions.positions
      .map(({ position: { pool_id } }) => pool_id)
      .filter((poolId): poolId is string => Boolean(poolId))
  );

  for (const bal of gammAssets) {
    // The pool share token is in the form of 'gamm/pool/${poolId}'.
    if (bal.denom.startsWith("gamm/pool/")) {
      const poolId = bal.denom.replace("gamm/pool/", "");
      userPoolIdsSet.add(poolId);
    }
  }

  const eventualPools = await timeout(
    () => getPools({ poolIds: Array.from(userPoolIdsSet) }),
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
          (pool.raw as WeightedPoolRawResponse).total_shares.amount
        );
        const rawShare = aggregateRawCoinsByDenom(
          lockedCoins.coins.filter((coin) => coin.denom === `gamm/pool/${id}`)
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
        isSuperfluid: superfluidPools.some(
          (superfluidPoolId) => superfluidPoolId === id
        ),
        userValue,
        weightedPoolInfo:
          pool.type === "weighted"
            ? {
                weights: (pool.raw as WeightedPoolRawResponse).pool_assets.map(
                  ({ token: { denom }, weight }) => {
                    const totalWeight = new Dec(
                      (pool.raw as WeightedPoolRawResponse).total_weight
                    );

                    return {
                      denom,
                      weight: new RatePretty(
                        new Dec(weight).quoTruncate(totalWeight)
                      ),
                    };
                  }
                ),
              }
            : undefined,
      };
    })
  );
}
