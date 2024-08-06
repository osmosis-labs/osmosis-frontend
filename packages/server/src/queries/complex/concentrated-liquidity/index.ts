import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { BigDec, maxTick, minTick, tickToSqrtPrice } from "@osmosis-labs/math";
import { AssetList, Chain } from "@osmosis-labs/types";
import { aggregateCoinsByDenom, timeout } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  calcCoinValue,
  calcSumCoinsValue,
  getAsset,
  mapRawCoinToPretty,
} from "../../../queries/complex/assets";
import { getPools } from "../../../queries/complex/pools";
import {
  getConcentratedRangePoolApr,
  getLockableDurations,
  getPoolIncentives,
} from "../../../queries/complex/pools/incentives";
import { getValidatorInfo } from "../../../queries/complex/staking/validator";
import { ConcentratedPoolRawResponse } from "../../../queries/osmosis";
import {
  LiquidityPosition,
  queryAccountPositions,
  queryAccountUnbondingPositions,
  queryLiquidityPerTickRange,
  queryPositionById,
} from "../../../queries/osmosis/concentratedliquidity";
import {
  queryAccountDelegatedPositions,
  queryAccountUndelegatingPositions,
} from "../../../queries/osmosis/superfluid";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { captureErrorAndReturn } from "../../../utils/error";
import { queryPositionPerformance } from "../../data-services";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
import { getSuperfluidPoolIds } from "../pools/superfluid";

/** Lists all of a user's coins within all concentrated liquidity positions, aggregated by denom. */
export async function getUserUnderlyingCoinsFromClPositions({
  assetLists,
  chainList,
  userOsmoAddress,
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  userOsmoAddress: string;
}): Promise<CoinPretty[]> {
  const clPositions = await queryAccountPositions({
    chainList,
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

  return aggregateCoinsByDenom(mapRawCoinToPretty(assetLists, positionAssets));
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

export function getTickPrice({
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

function getUserUnbondingPositions({
  chainList,
  bech32Address,
}: {
  chainList: Chain[];
  bech32Address: string;
}) {
  return cachified({
    cache: concentratedLiquidityCache,
    key: `unbonding-cl-positions-${bech32Address}`,
    ttl: 1000 * 5, // 5 seconds
    getFreshValue: () =>
      queryAccountUnbondingPositions({ chainList, bech32Address }),
  });
}

function getUserDelegatedPositions({
  chainList,
  bech32Address,
}: {
  chainList: Chain[];
  bech32Address: string;
}) {
  return cachified({
    cache: concentratedLiquidityCache,
    key: `delegated-cl-positions-${bech32Address}`,
    ttl: 1000 * 5, // 5 seconds
    getFreshValue: () =>
      queryAccountDelegatedPositions({ chainList, bech32Address }),
  });
}

function getUserUndelegatingPositions({
  chainList,
  bech32Address,
}: {
  chainList: Chain[];
  bech32Address: string;
}) {
  return cachified({
    cache: concentratedLiquidityCache,
    key: `undelegating-cl-positions-${bech32Address}`,
    ttl: 1000 * 5, // 5 seconds
    getFreshValue: () =>
      queryAccountUndelegatingPositions({ chainList, bech32Address }),
  });
}

export type UserPositionDetails = Awaited<
  ReturnType<typeof mapGetUserPositionDetails>
>[number];

/** Appends user and position details to a given set of positions.
 *  If positions are not provided, they will be fetched with the given user address. */
export async function mapGetUserPositionDetails({
  positions: initialPositions,
  userOsmoAddress,
  ...params
}: {
  chainList: Chain[];
  assetLists: AssetList[];
  positions?: LiquidityPosition[];
  userOsmoAddress: string;
}) {
  const positionsPromise = initialPositions
    ? Promise.resolve(initialPositions)
    : queryAccountPositions({ ...params, bech32Address: userOsmoAddress }).then(
        ({ positions }) => positions
      );
  const userUnbondingPositionsPromise = getUserUnbondingPositions({
    ...params,
    bech32Address: userOsmoAddress,
  });
  const delegatedPositionsPromise = getUserDelegatedPositions({
    ...params,
    bech32Address: userOsmoAddress,
  });
  const undelegatingPositionsPromise = getUserUndelegatingPositions({
    ...params,
    bech32Address: userOsmoAddress,
  });
  const superfluidPoolIdsPromise = getSuperfluidPoolIds(params);

  const [
    positions,
    userUnbondingPositions,
    delegatedPositions,
    undelegatingPositions,
    superfluidPoolIds,
  ] = await Promise.all([
    positionsPromise,
    userUnbondingPositionsPromise,
    delegatedPositionsPromise,
    undelegatingPositionsPromise,
    superfluidPoolIdsPromise,
  ]);

  const stakeCurrency = getAsset({
    ...params,
    anyDenom: params.chainList[0].staking!.staking_tokens[0].denom,
  });

  const lockableDurations = getLockableDurations();
  const longestLockDuration = lockableDurations[lockableDurations.length - 1];

  const pools = await getPools({
    ...params,
    poolIds: positions.map(({ position }) => position.pool_id),
  });

  if (!stakeCurrency) throw new Error(`Stake currency (OSMO) not found`);

  const eventualPositionsDetails = await Promise.all(
    positions.map(async (position_) => {
      const { asset0, asset1, position } = position_;

      const [baseCoin, quoteCoin] = mapRawCoinToPretty(params.assetLists, [
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
        await calcSumCoinsValue({ ...params, coins: [baseCoin, quoteCoin] })
      );

      const lowerTick = new Int(position.lower_tick);
      const upperTick = new Int(position.upper_tick);
      const priceRange = await Promise.all([
        getTickPrice({
          tick: lowerTick,
          baseCoin,
          quoteCoin,
        }),
        getTickPrice({
          tick: upperTick,
          baseCoin,
          quoteCoin,
        }),
      ]);

      // the APR range query involves a lot of calculation and can timeout the gateway
      // instead, let's timeout the query and return undefined if it takes too long
      const rangeApr = await timeout(
        () =>
          getConcentratedRangePoolApr({
            lowerTick: lowerTick.toString(),
            upperTick: upperTick.toString(),
            poolId: position.pool_id,
          })
            .then((rate) => rate ?? new RatePretty(0))
            .catch(() => new RatePretty(0)),
        4_000, // 4 seconds
        "getConcentratedRangePoolApr"
      )().catch(() => new RatePretty(0));

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
              rawDelegatedSuperfluidPosition.equivalent_staked_amount?.amount ??
                0
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
              rawUndelegatingSuperfluidPosition.equivalent_staked_amount
                ?.amount ?? 0
            ),
            endTime: new Date(
              rawUndelegatingSuperfluidPosition.synthetic_lock.end_time
            ),
          }
        : undefined;

      const currentPrice = getPriceFromSqrtPrice({
        // Given that we're only calculating for display purposes,
        // and not for quoting or provision of liquidity,
        // the loss of precision is acceptable.
        sqrtPrice: new BigDec(
          (pool.raw as ConcentratedPoolRawResponse).current_sqrt_price
        ).toDec(),
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
      )?.aprBreakdown?.superfluid?.upper;

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

        const validatorInfo = await getValidatorInfo({
          ...params,
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
          ...params,
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
          ? rangeApr.add(superfluidApr ?? new Dec(0))
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
  ...params
}: {
  chainList: Chain[];
  assetLists: AssetList[];
  positions?: LiquidityPosition[];
  userOsmoAddress: string;
  forPoolId?: string;
}) {
  const positionsPromise = initialPositions
    ? Promise.resolve(initialPositions)
    : queryAccountPositions({ ...params, bech32Address: userOsmoAddress }).then(
        ({ positions }) => positions
      );

  const positions = await positionsPromise;

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

        const [baseCoin, quoteCoin] = mapRawCoinToPretty(params.assetLists, [
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
          await calcSumCoinsValue({ ...params, coins: [baseCoin, quoteCoin] })
        );

        const lowerTick = new Int(position.lower_tick);
        const upperTick = new Int(position.upper_tick);
        const priceRange = await Promise.all([
          getTickPrice({
            tick: lowerTick,
            baseCoin,
            quoteCoin,
          }),
          getTickPrice({
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
  position: givenPosition,
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  /** Position by ID or the returned position object. */
  position: string | LiquidityPosition;
}) {
  const { position } =
    typeof givenPosition === "string"
      ? await queryPositionById({ ...params, id: givenPosition })
      : { position: givenPosition };

  const performance = await queryPositionPerformance({
    positionId: position.position.position_id,
  });

  // There is no performance data for this position
  if (performance.message) {
    console.error(
      `No performance data for position ${position.position.position_id}`
    );
  }

  // get all user CL coins, including claimable rewards
  const [
    principalCoins,
    currentCoins,
    claimableIncentiveCoins,
    claimableSpreadRewardCoins,
    totalIncentiveRewardCoins,
    totalSpreadRewardCoins,
  ] = [
    aggregateCoinsByDenom(
      mapRawCoinToPretty(params.assetLists, performance.principal?.assets ?? [])
    ),
    mapRawCoinToPretty(params.assetLists, [position.asset0, position.asset1]),
    aggregateCoinsByDenom(
      mapRawCoinToPretty(params.assetLists, position.claimable_incentives)
    ),
    aggregateCoinsByDenom(
      mapRawCoinToPretty(params.assetLists, position.claimable_spread_rewards)
    ),
    aggregateCoinsByDenom(
      mapRawCoinToPretty(
        params.assetLists,
        performance?.total_incentives_rewards ?? []
      )
    ),
    aggregateCoinsByDenom(
      mapRawCoinToPretty(
        params.assetLists,
        performance?.total_spread_rewards ?? []
      )
    ),
  ];

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

  const [
    currentValue,
    currentCoinsValues,
    principalValue,
    claimableRewardsValue,
    totalEarnedValue,
  ] = await Promise.all([
    calcSumCoinsValue({ ...params, coins: currentCoins })
      .then((value) => new PricePretty(DEFAULT_VS_CURRENCY, value))
      .catch(() => new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))),
    Promise.all(
      currentCoins
        .map((coin) => calcCoinValue({ ...params, coin }))
        .map((p) => p.catch((e) => captureErrorAndReturn(e, 0)))
    ).then((values) =>
      values.map((p) => new PricePretty(DEFAULT_VS_CURRENCY, p))
    ),
    calcSumCoinsValue({ ...params, coins: principalCoins }).then(
      (value) => new PricePretty(DEFAULT_VS_CURRENCY, value)
    ),
    calcSumCoinsValue({ ...params, coins: claimableRewardCoins }).then(
      (value) => new PricePretty(DEFAULT_VS_CURRENCY, value)
    ),
    calcSumCoinsValue({ ...params, coins: totalRewardCoins }).then(
      (value) => new PricePretty(DEFAULT_VS_CURRENCY, value)
    ),
  ]);

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

export type ActiveLiquidityPerTickRange = {
  /** Price-correlated tick index. */
  lowerTick: Int;
  upperTick: Int;
  /** Net liquidity, for calculating active liquidity. */
  liquidityAmount: Dec;
};

export async function getLiquidityPerTickRange(params: {
  poolId: string;
  chainList: Chain[];
}): Promise<ActiveLiquidityPerTickRange[]> {
  return queryLiquidityPerTickRange(params).then(({ liquidity }) =>
    liquidity.map(({ liquidity_amount, lower_tick, upper_tick }) => ({
      lowerTick: new Int(lower_tick),
      upperTick: new Int(upper_tick),
      liquidityAmount: new Dec(liquidity_amount),
    }))
  );
}
