import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { maxTick, minTick, tickToSqrtPrice } from "@osmosis-labs/math";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { ChainList } from "~/config/generated/chain-list";
import {
  calcCoinValue,
  calcSumCoinsValue,
  getAsset,
  mapRawCoinToPretty,
} from "~/server/queries/complex/assets";
import { getPools } from "~/server/queries/complex/pools";
import {
  getConcentratedRangePoolApr,
  getLockableDurations,
  getPoolIncentives,
} from "~/server/queries/complex/pools/incentives";
import { getValidatorInfo } from "~/server/queries/complex/staking/validator";
import { ConcentratedPoolRawResponse } from "~/server/queries/osmosis";
import {
  LiquidityPosition,
  queryAccountPositions,
  queryCLPosition,
  queryCLUnbondingPositions,
} from "~/server/queries/osmosis/concentratedliquidity";
import {
  queryDelegatedClPositions,
  queryUndelegatingClPositions,
} from "~/server/queries/osmosis/superfluid";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";
import { aggregateCoinsByDenom } from "~/utils/coin";

import { queryPositionPerformance } from "../../imperator";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
import { getSuperfluidPoolIds } from "../pools/superfluid";

/** Lists all of a user's coins within all concentrated liquidity positions, aggregated by denom. */
export async function getUserUnderlyingCoinsFromClPositions({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}): Promise<CoinPretty[]> {
  const clPositions = await queryAccountPositions({
    bech32Address: userOsmoAddress,
  });

  const positionAssets = clPositions.positions
    .map(
      ({ asset0, asset1, claimable_spread_rewards, claimable_incentives }) => [
        asset0,
        asset1,
        ...claimable_spread_rewards,
        ...claimable_incentives,
      ]
    )
    .flat();

  return await mapRawCoinToPretty(positionAssets).then(aggregateCoinsByDenom);
}

export type PositionStatus =
  | "inRange"
  | "nearBounds"
  | "outOfRange"
  | "fullRange"
  | "unbonding"
  | "superfluidStaked"
  | "superfluidUnstaking";

export function calcPositionStatus({
  lowerPrice,
  upperPrice,
  currentPrice,
  isFullRange,
  isSuperfluidStaked,
  isSuperfluidUnstaking,
  isUnbonding,
}: {
  lowerPrice: Dec;
  upperPrice: Dec;
  currentPrice: Dec;
  isFullRange: boolean;
  isSuperfluidStaked: boolean;
  isSuperfluidUnstaking: boolean;
  isUnbonding: boolean;
}): PositionStatus {
  const inRange = lowerPrice.lt(currentPrice) && upperPrice.gt(currentPrice);
  const diff = new Dec(
    Math.min(
      Number(currentPrice.sub(lowerPrice).toString()),
      Number(upperPrice.sub(currentPrice).toString())
    )
  );
  const rangeDiff = upperPrice.sub(lowerPrice);
  const diffPercentage =
    currentPrice.isZero() || rangeDiff.isZero()
      ? new Dec(0)
      : diff.quo(rangeDiff).mul(new Dec(100));

  let status: PositionStatus;

  if (inRange) {
    if (diffPercentage.lte(new Dec(15))) {
      status = "nearBounds";
    } else {
      status = "inRange";
    }
  } else {
    status = "outOfRange";
  }
  if (isFullRange) {
    status = "fullRange";
  }
  if (isUnbonding) {
    status = "unbonding";
  }
  if (isSuperfluidStaked) {
    status = "superfluidStaked";
  }
  if (isSuperfluidUnstaking) {
    status = "superfluidUnstaking";
  }

  return status;
}

export function getPriceFromSqrtPrice({
  sqrtPrice,
  baseCoin,
  quoteCoin,
}: {
  baseCoin: CoinPretty;
  quoteCoin: CoinPretty;
  sqrtPrice: Dec;
}) {
  const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
    baseCoin.currency.coinDecimals - quoteCoin.currency.coinDecimals
  );
  const price = sqrtPrice.mul(sqrtPrice).mul(multiplicationQuoteOverBase);
  return price;
}

export function getClTickPrice({
  tick,
  baseCoin,
  quoteCoin,
}: {
  tick: Int;
  baseCoin: CoinPretty;
  quoteCoin: CoinPretty;
}) {
  const sqrtPrice = tickToSqrtPrice(tick);
  return getPriceFromSqrtPrice({
    baseCoin,
    quoteCoin,
    sqrtPrice,
  });
}

const concentratedLiquidityCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

function getUnbondingClPositions({ bech32Address }: { bech32Address: string }) {
  return cachified({
    cache: concentratedLiquidityCache,
    key: `unbonding-cl-positions-${bech32Address}`,
    ttl: 1000 * 5, // 5 seconds
    staleWhileRevalidate: 1000 * 60 * 5, // 5 minutes
    getFreshValue: () => queryCLUnbondingPositions({ bech32Address }),
  });
}

function getDelegatedClPositions({ bech32Address }: { bech32Address: string }) {
  return cachified({
    cache: concentratedLiquidityCache,
    key: `delegated-cl-positions-${bech32Address}`,
    ttl: 1000 * 5, // 5 seconds
    staleWhileRevalidate: 1000 * 60 * 5, // 5 minutes
    getFreshValue: () => queryDelegatedClPositions({ bech32Address }),
  });
}

function getUndelegatingClPositions({
  bech32Address,
}: {
  bech32Address: string;
}) {
  return cachified({
    cache: concentratedLiquidityCache,
    key: `undelegating-cl-positions-${bech32Address}`,
    ttl: 1000 * 5, // 5 seconds
    staleWhileRevalidate: 1000 * 60 * 5, // 5 minutes
    getFreshValue: () => queryUndelegatingClPositions({ bech32Address }),
  });
}

export type ClPositionDetails = Awaited<
  ReturnType<typeof mapGetPositionDetails>
>[number];

/** Appends user and position details to a given set of positions.
 *  If positions are not provided, they will be fetched with the given user address. */
export async function mapGetPositionDetails({
  positions: initialPositions,
  userOsmoAddress,
}: {
  positions?: LiquidityPosition[];
  userOsmoAddress: string;
}) {
  const positionsPromise = initialPositions
    ? Promise.resolve(initialPositions)
    : queryAccountPositions({ bech32Address: userOsmoAddress }).then(
        ({ positions }) => positions
      );
  const lockableDurationsPromise = getLockableDurations();
  const userUnbondingPositionsPromise = getUnbondingClPositions({
    bech32Address: userOsmoAddress,
  });
  const delegatedPositionsPromise = getDelegatedClPositions({
    bech32Address: userOsmoAddress,
  });
  const undelegatingPositionsPromise = getUndelegatingClPositions({
    bech32Address: userOsmoAddress,
  });
  const stakeCurrencyPromise = getAsset({
    anyDenom: ChainList[0].staking.staking_tokens[0].denom,
  });
  const superfluidPoolIdsPromise = getSuperfluidPoolIds();

  const [
    positions,
    lockableDurations,
    userUnbondingPositions,
    delegatedPositions,
    undelegatingPositions,
    stakeCurrency,
    superfluidPoolIds,
  ] = await Promise.all([
    positionsPromise,
    lockableDurationsPromise,
    userUnbondingPositionsPromise,
    delegatedPositionsPromise,
    undelegatingPositionsPromise,
    stakeCurrencyPromise,
    superfluidPoolIdsPromise,
  ]);

  const pools = await getPools({
    poolIds: positions.map(({ position }) => position.pool_id),
  });

  if (!stakeCurrency) throw new Error(`Stake currency (OSMO) not found`);

  const eventualPositionsDetails = await Promise.all(
    positions.map(async (position_) => {
      const { asset0, asset1, position } = position_;

      const [baseCoin, quoteCoin] = await mapRawCoinToPretty([asset0, asset1]);
      if (!baseCoin || !quoteCoin) {
        throw new Error(
          `Error finding assets for position ${position.position_id}`
        );
      }
      const currentValue = new PricePretty(
        DEFAULT_VS_CURRENCY,
        (await calcSumCoinsValue([baseCoin, quoteCoin])) ?? 0
      );

      const lowerTick = new Int(position.lower_tick);
      const upperTick = new Int(position.upper_tick);
      const priceRangePromise = Promise.all([
        getClTickPrice({
          tick: lowerTick,
          baseCoin,
          quoteCoin,
        }),
        getClTickPrice({
          tick: upperTick,
          baseCoin,
          quoteCoin,
        }),
      ]);
      const rangeAprPromise = getConcentratedRangePoolApr({
        lowerTick: lowerTick.toString(),
        upperTick: upperTick.toString(),
        poolId: position.pool_id,
      });

      const [priceRange, rangeApr] = await Promise.all([
        priceRangePromise,
        rangeAprPromise,
      ]);

      const pool = pools.find((pool) => pool.id === position.pool_id);
      if (!pool) {
        throw new Error(`Pool (${position.pool_id}) not found`);
      }
      if (pool.type !== "concentrated") {
        throw new Error(
          `Pool type is not concentrated. Pool: ${JSON.stringify(pool)}`
        );
      }

      const periodLock = userUnbondingPositions.positions_with_period_lock.find(
        ({ position: unbondingPosition }) =>
          unbondingPosition.position_id === position.position_id
      );
      const isUnbonding = Boolean(periodLock);

      const rawDelegatedSuperfluidPosition =
        delegatedPositions.cl_pool_user_position_records.find(
          (delegatedPosition) =>
            delegatedPosition.position_id === position.position_id
        );
      const rawUndelegatingSuperfluidPosition =
        undelegatingPositions.cl_pool_user_position_records.find(
          (undelegatingPosition) =>
            undelegatingPosition.position_id === position.position_id
        );
      const isSuperfluidStaked = !!rawDelegatedSuperfluidPosition;
      const isSuperfluidUnstaking = !!rawUndelegatingSuperfluidPosition;

      const delegatedSuperfluidPosition = isSuperfluidStaked
        ? {
            positionId: rawDelegatedSuperfluidPosition.position_id,
            validatorAddress: rawDelegatedSuperfluidPosition.validator_address,
            lockId: rawDelegatedSuperfluidPosition.lock_id,
            equivalentStakedAmount: new CoinPretty(
              stakeCurrency,
              rawDelegatedSuperfluidPosition.equivalent_staked_amount.amount
            ),
          }
        : undefined;

      const undelegatingSuperfluidPosition = isSuperfluidUnstaking
        ? {
            positionId: rawUndelegatingSuperfluidPosition.position_id,
            validatorAddress:
              rawUndelegatingSuperfluidPosition.validator_address,
            lockId: rawUndelegatingSuperfluidPosition.lock_id,
            equivalentStakedAmount: new CoinPretty(
              stakeCurrency,
              rawUndelegatingSuperfluidPosition.equivalent_staked_amount.amount
            ),
            endTime: new Date(
              rawUndelegatingSuperfluidPosition.synthetic_lock.end_time
            ),
          }
        : undefined;

      const currentPrice = getPriceFromSqrtPrice({
        sqrtPrice: new Dec(
          (pool.raw as ConcentratedPoolRawResponse).current_sqrt_price
        ),
        baseCoin,
        quoteCoin,
      });

      const isFullRange =
        lowerTick.equals(minTick) && upperTick.equals(maxTick);

      const status = calcPositionStatus({
        currentPrice,
        lowerPrice: priceRange[0],
        upperPrice: priceRange[1],
        isFullRange,
        isSuperfluidStaked,
        isSuperfluidUnstaking,
        isUnbonding,
      });

      const superfluidApr: RatePretty | undefined = (
        await getPoolIncentives(pool.id)
      )?.aprBreakdown?.superfluid;

      /** User's current superfluid delegation or undelegation */
      let superfluidData:
        | (Awaited<ReturnType<typeof getValidatorInfo>> & {
            equivalentStakedAmount: CoinPretty;
            superfluidApr: RatePretty;
            /** Is sitting delegation */
            delegationLockId?: string;
            /** Is sitting delegation */
            humanizedStakeDuration?: string;

            /** Is undelegation */
            undelegationEndTime?: Date;
          })
        | undefined = undefined;

      if (isSuperfluidStaked && delegatedSuperfluidPosition) {
        // delegated position info

        const longestLockDuration =
          lockableDurations[lockableDurations.length - 1];
        const validatorInfo = await getValidatorInfo({
          validatorBech32Address: delegatedSuperfluidPosition.validatorAddress,
        });

        superfluidData = {
          ...validatorInfo,
          delegationLockId: delegatedSuperfluidPosition.lockId,
          equivalentStakedAmount:
            delegatedSuperfluidPosition.equivalentStakedAmount,
          superfluidApr: superfluidApr ?? new RatePretty(0),
          humanizedStakeDuration: longestLockDuration.humanize(),
        };
      } else if (isSuperfluidUnstaking && undelegatingSuperfluidPosition) {
        // undelegating position info

        const validatorInfo = await getValidatorInfo({
          validatorBech32Address:
            undelegatingSuperfluidPosition.validatorAddress,
        });
        superfluidData = {
          ...validatorInfo,
          undelegationEndTime: undelegatingSuperfluidPosition.endTime,
          equivalentStakedAmount:
            undelegatingSuperfluidPosition.equivalentStakedAmount,
          superfluidApr: superfluidApr ?? new RatePretty(0),
        };
      }

      const totalRangeApr =
        isSuperfluidStaked || isSuperfluidUnstaking
          ? rangeApr?.add(superfluidApr ?? new Dec(0))
          : rangeApr;

      return {
        id: position.position_id,
        poolId: position.pool_id,
        spreadFactor: pool.spreadFactor,
        currentPrice,
        currentValue,
        status,
        rangeApr: totalRangeApr,
        unbondEndTime: periodLock
          ? new Date(periodLock.locks.end_time)
          : undefined,
        isPoolSuperfluid: superfluidPoolIds.includes(position.pool_id),
        superfluidApr,
        ...(superfluidData ? { superfluidData } : undefined),
      };
    })
  );

  return eventualPositionsDetails.filter(
    (p): p is NonNullable<typeof p> => !!p
  );
}

export type UserPosition = Awaited<
  ReturnType<typeof mapGetUserPositions>
>[number];

export async function mapGetUserPositions({
  positions: initialPositions,
  userOsmoAddress,
  forPoolId,
}: {
  positions?: LiquidityPosition[];
  userOsmoAddress: string;
  forPoolId?: string;
}) {
  const positionsPromise = initialPositions
    ? Promise.resolve(initialPositions)
    : queryAccountPositions({ bech32Address: userOsmoAddress }).then(
        ({ positions }) => positions
      );

  const stakeCurrencyPromise = getAsset({
    anyDenom: ChainList[0].staking.staking_tokens[0].denom,
  });

  const [positions, stakeCurrency] = await Promise.all([
    positionsPromise,
    stakeCurrencyPromise,
  ]);

  if (!stakeCurrency) throw new Error(`Stake currency (OSMO) not found`);

  const userPositions = await Promise.all(
    positions
      .filter((position) => {
        if (Boolean(forPoolId) && position.position.pool_id !== forPoolId) {
          return false;
        }
        return true;
      })
      .map(async (position_) => {
        const { asset0, asset1, position } = position_;

        const [baseCoin, quoteCoin] = await mapRawCoinToPretty([
          asset0,
          asset1,
        ]);
        if (!baseCoin || !quoteCoin) {
          throw new Error(
            `Error finding assets for position ${position.position_id}`
          );
        }
        const currentValue = new PricePretty(
          DEFAULT_VS_CURRENCY,
          (await calcSumCoinsValue([baseCoin, quoteCoin])) ?? 0
        );

        const lowerTick = new Int(position.lower_tick);
        const upperTick = new Int(position.upper_tick);
        const priceRange = await Promise.all([
          getClTickPrice({
            tick: lowerTick,
            baseCoin,
            quoteCoin,
          }),
          getClTickPrice({
            tick: upperTick,
            baseCoin,
            quoteCoin,
          }),
        ]);

        const isFullRange =
          lowerTick.equals(minTick) && upperTick.equals(maxTick);

        return {
          id: position.position_id,
          poolId: position.pool_id,
          position: position_,
          currentCoins: [baseCoin, quoteCoin],
          currentValue,
          isFullRange,
          priceRange,
          liquidity: new Dec(position.liquidity),
          joinTime: new Date(position.join_time),
        };
      })
  );

  return userPositions.filter((p): p is NonNullable<typeof p> => !!p);
}

export type PositionHistoricalPerformance = Awaited<
  ReturnType<typeof getPositionHistoricalPerformance>
>;

/** Gets a breakdown of current and reward coins, with fiat values, for a single CL position. */
export async function getPositionHistoricalPerformance({
  positionId,
}: {
  positionId: string;
}) {
  const [{ position }, performance] = await Promise.all([
    queryCLPosition({ id: positionId }),
    queryPositionPerformance({
      positionId,
    }),
  ]);

  // There is no performance data for this position
  if (performance.message) {
    console.error(`No performance data for position ${positionId}`);
  }

  // get all user CL coins, including claimable rewards
  const [
    principalCoins,
    currentCoins,
    claimableIncentiveCoins,
    claimableSpreadRewardCoins,
    totalIncentiveRewardCoins,
    totalSpreadRewardCoins,
  ] = await Promise.all([
    mapRawCoinToPretty(performance.principal?.assets ?? [])
      .then(aggregateCoinsByDenom)
      .catch(() => []),
    mapRawCoinToPretty([position.asset0, position.asset1]),
    mapRawCoinToPretty(position.claimable_incentives).then(
      aggregateCoinsByDenom
    ),
    mapRawCoinToPretty(position.claimable_spread_rewards).then(
      aggregateCoinsByDenom
    ),
    mapRawCoinToPretty(performance?.total_incentives_rewards ?? [])
      .then(aggregateCoinsByDenom)
      .catch(() => []),
    mapRawCoinToPretty(performance?.total_spread_rewards ?? [])
      .then(aggregateCoinsByDenom)
      .catch(() => []),
  ]);

  if (currentCoins.length !== 2)
    throw new Error("Unexpected number of current position listed coins");

  const claimableRewardCoins = aggregateCoinsByDenom([
    ...claimableIncentiveCoins,
    ...claimableSpreadRewardCoins,
  ]);
  const totalRewardCoins = aggregateCoinsByDenom([
    ...totalIncentiveRewardCoins,
    ...totalSpreadRewardCoins,
  ]);

  // calculate fiat values

  const currentValue = new PricePretty(
    DEFAULT_VS_CURRENCY,
    (await calcSumCoinsValue(currentCoins)) ?? 0
  );
  const currentCoinsValues = (
    await Promise.all(currentCoins.map(calcCoinValue))
  )
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => new PricePretty(DEFAULT_VS_CURRENCY, p));
  const principalValue = new PricePretty(
    DEFAULT_VS_CURRENCY,
    (await calcSumCoinsValue(principalCoins)) ?? 0
  );
  const claimableRewardsValue = new PricePretty(
    DEFAULT_VS_CURRENCY,
    (await calcSumCoinsValue(claimableRewardCoins)) ?? 0
  );
  const totalEarnedValue = new PricePretty(
    DEFAULT_VS_CURRENCY,
    (await calcSumCoinsValue(totalRewardCoins)) ?? 0
  );

  const principalValueDec = principalValue.toDec();

  const roi = new RatePretty(
    currentValue
      .toDec()
      .add(claimableRewardsValue.toDec())
      .add(totalEarnedValue.toDec())
      .sub(principalValueDec)
      .quo(
        // Principal can be 0 if the position is not found
        principalValueDec.equals(new Dec(0)) ? new Dec(1) : principalValueDec
      )
  );

  return {
    currentCoins,
    currentCoinsValues,
    currentValue,
    principalCoins,
    principalValue,
    claimableRewardCoins,
    claimableRewardsValue,
    totalRewardCoins,
    totalEarnedValue,
    roi,
  };
}
