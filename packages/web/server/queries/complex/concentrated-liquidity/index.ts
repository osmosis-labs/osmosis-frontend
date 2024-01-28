import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { maxTick, minTick, tickToSqrtPrice } from "@osmosis-labs/math";

import { ChainList } from "~/config/generated/chain-list";
import {
  calcCoinValue,
  calcSumCoinsValue,
  getAsset,
  mapListedCoins,
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
  queryCLPositions,
  queryCLUnbondingPositions,
} from "~/server/queries/osmosis/concentratedliquidity";
import {
  queryDelegatedClPositions,
  queryUndelegatingClPositions,
} from "~/server/queries/osmosis/superfluid";
import { aggregateCoinsByDenom } from "~/utils/coin";

import { queryPositionPerformance } from "../../imperator";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
import { isPoolSuperfluid } from "../pools/superfluid";

/** Lists all of a user's coins within all concentrated liquidity positions, aggregated by denom. */
export async function getUserUnderlyingCoinsFromClPositions({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}): Promise<CoinPretty[]> {
  const clPositions = await queryCLPositions({
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

  return await mapListedCoins(positionAssets).then(aggregateCoinsByDenom);
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
  baseAsset,
  quoteAsset,
}: {
  baseAsset: CoinPretty;
  quoteAsset: CoinPretty;
  sqrtPrice: Dec;
}) {
  const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
    baseAsset.currency.coinDecimals - quoteAsset.currency.coinDecimals
  );
  const price = sqrtPrice.mul(sqrtPrice).mul(multiplicationQuoteOverBase);
  return price;
}

export function getClTickPrice({
  tick,
  baseAsset,
  quoteAsset,
}: {
  tick: Int;
  baseAsset: CoinPretty;
  quoteAsset: CoinPretty;
}) {
  const sqrtPrice = tickToSqrtPrice(tick);
  return getPriceFromSqrtPrice({
    baseAsset,
    quoteAsset,
    sqrtPrice,
  });
}

export type UserPosition = Awaited<
  ReturnType<typeof mapGetUserPositionDetails>
>[number];

/** Appends user and position details to a given set of positions.
 *  If positions are not provided, they will be fetched with the given user address. */
export async function mapGetUserPositionDetails({
  positions,
  userOsmoAddress,
}: {
  positions?: LiquidityPosition[];
  userOsmoAddress: string;
}) {
  if (!positions)
    positions = (await queryCLPositions({ bech32Address: userOsmoAddress }))
      .positions;

  const poolIds = positions.map(({ position: { pool_id } }) => pool_id);
  const positionPools = await getPools({ poolIds: poolIds });

  const lockableDurations = await getLockableDurations();

  const userUnbondingPositionsPromise = queryCLUnbondingPositions({
    bech32Address: userOsmoAddress,
  });
  const delegatedPositionsPromise = queryDelegatedClPositions({
    bech32Address: userOsmoAddress,
  });
  const undelegatingPositionsPromise = queryUndelegatingClPositions({
    bech32Address: userOsmoAddress,
  });

  const stakeCurrencyPromise = getAsset({
    anyDenom: ChainList[0].staking.staking_tokens[0].denom,
  });

  const [
    userUnbondingPositions,
    delegatedPositions,
    undelegatingPositions,
    stakeCurrency,
  ] = await Promise.all([
    userUnbondingPositionsPromise,
    delegatedPositionsPromise,
    undelegatingPositionsPromise,
    stakeCurrencyPromise,
  ]);

  if (!stakeCurrency) throw new Error(`Stake currency (OSMO) not found`);

  const eventualPositionsDetails = await Promise.all(
    positions.map(async (position_) => {
      const { asset0, asset1, position } = position_;

      const [baseAsset, quoteAsset] = await mapListedCoins([asset0, asset1]);

      if (!baseAsset || !quoteAsset) {
        throw new Error(
          `Error finding assets for position ${position.position_id}`
        );
      }

      const lowerTick = new Int(position.lower_tick);
      const upperTick = new Int(position.upper_tick);
      const priceRangePromise = Promise.all([
        getClTickPrice({
          tick: lowerTick,
          baseAsset,
          quoteAsset,
        }),
        getClTickPrice({
          tick: upperTick,
          baseAsset,
          quoteAsset,
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

      const pool = positionPools.find((pool) => pool.id === position.pool_id);

      if (!pool) {
        throw new Error(`Pool (${position.pool_id}) not found`);
      }
      if (pool.type !== "concentrated") {
        throw new Error(
          `Pool type is not concentrated. Pool: ${JSON.stringify(pool)}`
        );
      }

      const liquidity = new Dec(position.liquidity);

      const isPoolSuperfluid_ = await isPoolSuperfluid({ poolId: pool.id });

      const periodLock = userUnbondingPositions.positions_with_period_lock.find(
        ({ position: unbondingPosition }) =>
          unbondingPosition.position_id === position.position_id
      );
      const isUnbonding = Boolean(periodLock);
      const unbondEndTime = periodLock
        ? new Date(periodLock.locks.end_time)
        : undefined;

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
        baseAsset,
        quoteAsset,
      });

      const isFullRange =
        lowerTick.equals(minTick) && upperTick.equals(maxTick);

      const status = calcPositionStatus({
        currentPrice,
        isFullRange,
        isSuperfluidStaked,
        isSuperfluidUnstaking,
        isUnbonding,
        lowerPrice: priceRange[0],
        upperPrice: priceRange[1],
      });
      const joinTime = new Date(position.join_time);

      const superfluidApr: RatePretty | undefined =
        isSuperfluidStaked || isSuperfluidUnstaking
          ? (await getPoolIncentives(pool.id))?.aprBreakdown?.superfluid
          : undefined;

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
          superfluidApr: superfluidApr!,
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
          superfluidApr: superfluidApr!,
        };
      }

      const totalRangeApr = rangeApr?.add(superfluidApr ?? new Dec(0));

      return {
        id: position.position_id,
        poolId: position.pool_id,
        spreadFactor: pool.spreadFactor,
        currentPrice,
        isFullRange,
        status,
        priceRange,
        liquidity,
        joinTime,
        rangeApr: totalRangeApr,
        unbondEndTime,
        isPoolSuperfluid: isPoolSuperfluid_,
        superfluidApr,
        ...(superfluidData ? { superfluidData } : undefined),
        ...(await getPositionCoinsBreakdown({
          position: position_,
        })),
      };
    })
  );

  return eventualPositionsDetails.filter(
    (p): p is NonNullable<typeof p> => !!p
  );
}

/** Gets a breakdown of current and reward coins, with fiat values, for a single CL position. */
async function getPositionCoinsBreakdown({
  position,
}: {
  position: LiquidityPosition;
}) {
  const performance = await queryPositionPerformance({
    positionId: position.position.position_id,
  });

  // get all user CL coins, including claimable rewards

  const [
    principalCoins,
    currentCoins,
    claimableIncentiveCoins,
    claimableSpreadRewardCoins,
    totalIncentiveRewardCoins,
    totalSpreadRewardCoins,
  ] = await Promise.all([
    mapListedCoins(performance.principal.assets).then(aggregateCoinsByDenom),
    mapListedCoins([position.asset0, position.asset1]),

    mapListedCoins(position.claimable_incentives).then(aggregateCoinsByDenom),
    mapListedCoins(position.claimable_spread_rewards).then(
      aggregateCoinsByDenom
    ),

    mapListedCoins(performance.total_incentives_rewards).then(
      aggregateCoinsByDenom
    ),
    mapListedCoins(performance.total_spread_rewards).then(
      aggregateCoinsByDenom
    ),
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

  const roi = new RatePretty(
    currentValue
      .toDec()
      .add(claimableRewardsValue.toDec())
      .add(totalEarnedValue.toDec())
      .sub(principalValue.toDec())
      .quo(principalValue.toDec())
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
