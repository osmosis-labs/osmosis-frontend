import type {
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "@osmosis-labs/types";
import { AssetList, Chain } from "@osmosis-labs/types";
import { Dec, Int } from "@osmosis-labs/unit";

import { captureErrorAndReturn } from "../../../utils/error";
import { queryBalances } from "../../cosmos";
import {
  LiquidityPosition,
  queryAccountDelegatedPositions,
  queryAccountPositions,
  queryAccountUnbondingPositions,
  queryAccountUndelegatingPositions,
  querySyntheticLockupsByLockId,
  SyntheticLock,
} from "../../osmosis";
import { queryActiveOrdersSQS, SQSActiveOrder } from "../../sidecar/orderbooks";
import { getUserLocks, UserLock } from "../osmosis/lockup";
import { getPools } from "../pools";

type RawCoin = { denom: string; amount: string };

/** Lock state, as far as the forced-migration popup cares: `available` can be
 *  withdrawn now, `locked` / `superfluidStaked` need an unlock first, and
 *  `unlocking` is already on its way out, so it isn't nagged about. */
export type HoldingLockState =
  "available" | "locked" | "superfluidStaked" | "unlocking";

/** A classic (weighted or stable) pool share balance in one lock state. */
export type ShareHolding = {
  kind: "share";
  poolId: string;
  state: Exclude<HoldingLockState, "superfluidStaked">;
  /** Raw `gamm/pool/{poolId}` amount. */
  shares: string;
  /** Locks holding the shares (`locked` and `unlocking` only). A superfluid
   *  lock is `isSynthetic`. */
  locks: { lockId: string; isSynthetic: boolean }[];
  /** Latest end time across the locks, for `unlocking`. */
  unlockEndTime?: string;
  /** Longest lock duration, for `locked`: how long an unlock started now
   *  takes. */
  unlockDurationSeconds?: number;
  /** Pro-rata underlying coins at the current pool state. */
  coins: RawCoin[];
  oldDenomAmount: string;
};

export type ConcentratedHolding = {
  kind: "cl";
  poolId: string;
  positionId: string;
  state: Exclude<HoldingLockState, "locked">;
  liquidity: string;
  lowerTick: string;
  upperTick: string;
  /** Superfluid delegation lock, for `superfluidStaked`. */
  lockId?: string;
  unlockDurationSeconds?: number;
  unlockEndTime?: string;
  /** `[asset0, asset1]`, in the position's own order. */
  coins: RawCoin[];
  oldDenomAmount: string;
};

export type OrderHolding = {
  kind: "order";
  orderbookAddress: string;
  orderId: number;
  tickId: number;
  /** Fraction filled and claimed, 0 to 1. */
  percentFilled: string;
  percentClaimed: string;
  /** Denom the order was placed with and the denom it fills into. */
  inDenom: string;
  outDenom: string;
  /** Unfilled amount still in the order, raw `inDenom`. */
  remaining: string;
  /** Filled but not yet claimed, raw `outDenom`. */
  unclaimed: string;
  oldDenomAmount: string;
};

export type ForcedMigrationHolding =
  ShareHolding | ConcentratedHolding | OrderHolding;

const GAMM_PREFIX = "gamm/pool/";
const SUPERBONDING = "/superbonding/";
const SUPERUNBONDING = "/superunbonding/";

/**
 * Where the old assets of a forced migration sit outside the bank balance,
 * one row per pool position, lock or limit order, read from chain state and
 * SQS active orders. Unlike the portfolio categories, this tells unlocking
 * shares apart from locked ones: SQS `in-locks` adds the chain's locked coins,
 * which already include unlocking coins, to the unlocking coins again.
 *
 * Out of scope: cosmwasm pool shares (transmuter LP shares aren't decomposed
 * anywhere) and staking.
 *
 * Throws if chain state can't be read; limit orders are best effort, since
 * they come from SQS and are a smaller share of holdings.
 */
export async function getForcedMigrationHoldings({
  assetLists,
  chainList,
  bech32Address,
  denoms,
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  bech32Address: string;
  /** Minimal denoms being migrated out of. */
  denoms: string[];
}): Promise<ForcedMigrationHolding[]> {
  const oldDenoms = new Set(denoms);
  if (oldDenoms.size === 0) return [];

  const [
    balances,
    locks,
    positions,
    unbondingPositions,
    delegatedPositions,
    undelegatingPositions,
    orders,
  ] = await Promise.all([
    queryBalances({ chainList, bech32Address }),
    getUserLocks({ chainList, bech32Address }),
    queryAccountPositions({ chainList, bech32Address }),
    queryAccountUnbondingPositions({ chainList, bech32Address }),
    queryAccountDelegatedPositions({ chainList, bech32Address }),
    queryAccountUndelegatingPositions({ chainList, bech32Address }),
    queryActiveOrdersSQS({ userOsmoAddress: bech32Address })
      .then(({ orders }) => orders)
      .catch((e) => captureErrorAndReturn(e, [] as SQSActiveOrder[])),
  ]);

  const concentrated = getConcentratedHoldings({
    positions: positions.positions,
    oldDenoms,
    lockDurations: new Map(
      locks.map(({ ID, duration }) => [ID, duration.asSeconds()])
    ),
    unbonding: unbondingPositions.positions_with_period_lock.map(
      ({ position, locks }) => ({
        positionId: position.position_id,
        endTime: locks.end_time,
      })
    ),
    delegated: delegatedPositions.cl_pool_user_position_records.map(
      ({ position_id, lock_id }) => ({
        positionId: position_id,
        lockId: lock_id,
      })
    ),
    undelegating: undelegatingPositions.cl_pool_user_position_records.map(
      ({ position_id, synthetic_lock }) => ({
        positionId: position_id,
        endTime: synthetic_lock.end_time,
      })
    ),
  });

  const share = await getShareHoldings({
    assetLists,
    chainList,
    oldDenoms,
    bankShares: balances.balances.filter(({ denom }) =>
      denom.startsWith(GAMM_PREFIX)
    ),
    locks,
  });

  return [
    ...share,
    ...concentrated,
    ...getOrderHoldings({ orders, oldDenoms }),
  ];
}

async function getShareHoldings({
  assetLists,
  chainList,
  oldDenoms,
  bankShares,
  locks,
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  oldDenoms: Set<string>;
  bankShares: RawCoin[];
  locks: UserLock[];
}): Promise<ShareHolding[]> {
  const shareLocks = locks.filter(({ coins }) =>
    coins.some(({ denom }) => denom.startsWith(GAMM_PREFIX))
  );
  const poolIds = [
    ...new Set(
      [...bankShares, ...shareLocks.flatMap(({ coins }) => coins)]
        .filter(({ denom }) => denom.startsWith(GAMM_PREFIX))
        .map(({ denom }) => denom.slice(GAMM_PREFIX.length))
    ),
  ];
  if (poolIds.length === 0) return [];

  const { items: pools } = await getPools({ assetLists, chainList, poolIds });
  const poolById = new Map(
    pools
      .filter(
        (pool) =>
          (pool.type === "weighted" || pool.type === "stable") &&
          pool.reserveCoins.some(({ currency }) =>
            oldDenoms.has(currency.coinMinimalDenom)
          )
      )
      .map((pool) => [pool.id, pool])
  );
  if (poolById.size === 0) return [];

  // Only locks in affected pools are checked for superfluid synthetic locks.
  const relevantLocks = shareLocks.filter(({ coins }) =>
    coins.some(({ denom }) => poolById.has(denom.slice(GAMM_PREFIX.length)))
  );
  const syntheticByLockId = new Map(
    await Promise.all(
      relevantLocks
        .filter(({ isCurrentlyUnlocking }) => !isCurrentlyUnlocking)
        .map(
          async ({ ID }) =>
            [
              ID,
              (await querySyntheticLockupsByLockId({ chainList, lockId: ID }))
                .synthetic_locks,
            ] as const
        )
    )
  );

  const grouped = groupShareLocks({
    bankShares,
    locks: relevantLocks,
    syntheticByLockId,
  });

  return grouped.flatMap((group) => {
    const pool = poolById.get(group.poolId);
    if (!pool) return [];
    const raw = pool.raw as StablePoolRawResponse | WeightedPoolRawResponse;
    const coins = estimateShareExitCoins({
      totalShares: raw.total_shares.amount,
      reserves: pool.reserveCoins.map((coin) => coin.toCoin()),
      exitFee: pool.type === "weighted" ? raw.pool_params.exit_fee : "0",
      shares: group.shares,
    });
    return [
      {
        kind: "share" as const,
        ...group,
        coins,
        oldDenomAmount: sumOldDenom(coins, oldDenoms),
      },
    ];
  });
}

/**
 * Groups share balances per pool and lock state. A lock with a superbonding
 * synthetic lock is superfluid staked (`locked`, `isSynthetic`). One with only
 * a superunbonding synthetic lock is undelegating, so it counts as
 * `unlocking` until the synthetic lock ends.
 */
export function groupShareLocks({
  bankShares,
  locks,
  syntheticByLockId,
}: {
  bankShares: RawCoin[];
  locks: Pick<
    UserLock,
    "ID" | "coins" | "isCurrentlyUnlocking" | "endTime" | "duration"
  >[];
  syntheticByLockId: Map<
    string,
    Pick<SyntheticLock, "synth_denom" | "end_time">[]
  >;
}): Omit<ShareHolding, "kind" | "coins" | "oldDenomAmount">[] {
  type Group = Omit<ShareHolding, "kind" | "coins" | "oldDenomAmount">;
  const groups = new Map<string, Group>();
  const add = (
    poolId: string,
    state: Group["state"],
    shares: string,
    lock?: {
      lockId: string;
      isSynthetic: boolean;
      endTime?: string;
      durationSeconds?: number;
    }
  ) => {
    const key = `${poolId}:${state}`;
    const group = groups.get(key) ?? {
      poolId,
      state,
      shares: "0",
      locks: [],
    };
    group.shares = new Int(group.shares).add(new Int(shares)).toString();
    if (lock) {
      group.locks.push({ lockId: lock.lockId, isSynthetic: lock.isSynthetic });
      if (
        lock.endTime &&
        (!group.unlockEndTime ||
          new Date(lock.endTime) > new Date(group.unlockEndTime))
      )
        group.unlockEndTime = lock.endTime;
      if (
        lock.durationSeconds !== undefined &&
        lock.durationSeconds > (group.unlockDurationSeconds ?? 0)
      )
        group.unlockDurationSeconds = lock.durationSeconds;
    }
    groups.set(key, group);
  };

  for (const { denom, amount } of bankShares) {
    if (!denom.startsWith(GAMM_PREFIX) || !new Int(amount).isPositive())
      continue;
    add(denom.slice(GAMM_PREFIX.length), "available", amount);
  }

  for (const lock of locks) {
    const synthetic = syntheticByLockId.get(lock.ID) ?? [];
    const superbonding = synthetic.some(({ synth_denom }) =>
      synth_denom.includes(SUPERBONDING)
    );
    const superunbonding = synthetic.find(({ synth_denom }) =>
      synth_denom.includes(SUPERUNBONDING)
    );

    for (const { denom, amount } of lock.coins) {
      if (!denom.startsWith(GAMM_PREFIX)) continue;
      const poolId = denom.slice(GAMM_PREFIX.length);
      if (lock.isCurrentlyUnlocking) {
        add(poolId, "unlocking", amount, {
          lockId: lock.ID,
          isSynthetic: false,
          endTime: lock.endTime.toISOString(),
        });
      } else if (superunbonding && !superbonding) {
        add(poolId, "unlocking", amount, {
          lockId: lock.ID,
          isSynthetic: false,
          endTime: superunbonding.end_time,
        });
      } else {
        add(poolId, "locked", amount, {
          lockId: lock.ID,
          isSynthetic: superbonding,
          durationSeconds: lock.duration.asSeconds(),
        });
      }
    }
  }

  return [...groups.values()];
}

/**
 * Pro-rata coins for exiting `shares` of a classic pool, rounded down as the
 * chain does: each reserve times the shares (less the exit fee) over the
 * total shares.
 */
export function estimateShareExitCoins({
  totalShares,
  reserves,
  exitFee,
  shares,
}: {
  totalShares: string;
  reserves: RawCoin[];
  exitFee: string;
  shares: string;
}): RawCoin[] {
  const total = new Dec(totalShares);
  if (!total.isPositive()) return [];
  const refunded = new Dec(shares).mul(new Dec(1).sub(new Dec(exitFee)));
  return reserves.map(({ denom, amount }) => ({
    denom,
    amount: new Dec(amount).mul(refunded).quo(total).truncate().toString(),
  }));
}

/**
 * CL positions holding an old denom. Undelegating and unbonding positions are
 * `unlocking`; superfluid delegated ones carry their lock id. Bonded CL
 * positions that aren't superfluid don't occur on Osmosis.
 */
export function getConcentratedHoldings({
  positions,
  oldDenoms,
  lockDurations,
  unbonding,
  delegated,
  undelegating,
}: {
  positions: Pick<LiquidityPosition, "position" | "asset0" | "asset1">[];
  oldDenoms: Set<string>;
  /** Lock duration in seconds by lock id. */
  lockDurations: Map<string, number>;
  unbonding: { positionId: string; endTime: string }[];
  delegated: { positionId: string; lockId: string }[];
  undelegating: { positionId: string; endTime: string }[];
}): ConcentratedHolding[] {
  return positions.flatMap(({ position, asset0, asset1 }) => {
    const coins = [asset0, asset1].filter(Boolean);
    const oldDenomAmount = sumOldDenom(coins, oldDenoms);
    if (!new Int(oldDenomAmount).isPositive()) return [];

    const id = position.position_id;
    const unlockEnd =
      undelegating.find(({ positionId }) => positionId === id)?.endTime ??
      unbonding.find(({ positionId }) => positionId === id)?.endTime;
    const delegation = delegated.find(({ positionId }) => positionId === id);

    const state: ConcentratedHolding["state"] = unlockEnd
      ? "unlocking"
      : delegation
        ? "superfluidStaked"
        : "available";

    return [
      {
        kind: "cl" as const,
        poolId: position.pool_id,
        positionId: id,
        state,
        liquidity: position.liquidity,
        lowerTick: position.lower_tick,
        upperTick: position.upper_tick,
        lockId: state === "superfluidStaked" ? delegation?.lockId : undefined,
        unlockDurationSeconds:
          state === "superfluidStaked" && delegation
            ? lockDurations.get(delegation.lockId)
            : undefined,
        unlockEndTime: state === "unlocking" ? unlockEnd : undefined,
        coins,
        oldDenomAmount,
      },
    ];
  });
}

/**
 * Limit orders holding an old denom: the unfilled amount when it was placed
 * with one (a bid on a book quoted in it), and filled but unclaimed proceeds
 * when it fills into one (an ask on such a book).
 */
export function getOrderHoldings({
  orders,
  oldDenoms,
}: {
  orders: SQSActiveOrder[];
  oldDenoms: Set<string>;
}): OrderHolding[] {
  return orders.flatMap((order) => {
    const quoteDenom = order.quote_asset.symbol;
    const baseDenom = order.base_asset.symbol;
    const isBid = order.order_direction === "bid";
    const inDenom = isBid ? quoteDenom : baseDenom;
    const outDenom = isBid ? baseDenom : quoteDenom;

    const remaining = new Dec(order.quantity).truncate();
    const unfilledClaims = new Dec(order.percentFilled).sub(
      new Dec(order.percentClaimed)
    );
    const unclaimed = unfilledClaims.isPositive()
      ? new Dec(order.output).mul(unfilledClaims).truncate()
      : new Int(0);

    let oldDenomAmount = new Int(0);
    if (oldDenoms.has(inDenom)) oldDenomAmount = oldDenomAmount.add(remaining);
    if (oldDenoms.has(outDenom)) oldDenomAmount = oldDenomAmount.add(unclaimed);
    if (!oldDenomAmount.isPositive()) return [];

    return [
      {
        kind: "order" as const,
        orderbookAddress: order.orderbookAddress,
        orderId: order.order_id,
        tickId: order.tick_id,
        percentFilled: order.percentFilled,
        percentClaimed: order.percentClaimed,
        inDenom,
        outDenom,
        remaining: remaining.toString(),
        unclaimed: unclaimed.toString(),
        oldDenomAmount: oldDenomAmount.toString(),
      },
    ];
  });
}

function sumOldDenom(coins: RawCoin[], oldDenoms: Set<string>): string {
  return coins
    .filter(({ denom }) => oldDenoms.has(denom))
    .reduce((sum, { amount }) => sum.add(new Int(amount)), new Int(0))
    .toString();
}
