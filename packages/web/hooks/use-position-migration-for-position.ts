import type { ConcentratedPoolRawResponse } from "@osmosis-labs/server";
import { Dec } from "@osmosis-labs/unit";
import {
  createMultiEndpointClient,
  MultiEndpointClient,
} from "@osmosis-labs/utils";
import { useCallback } from "react";

import { ChainList } from "~/config/generated/chain-list";
import {
  USDC_ALLOYED_DENOM,
  USDC_NOBLE_DENOM,
} from "~/config/position-migration";
import {
  queryLatestPositionMigrations,
  usePositionMigrations,
} from "~/hooks/use-position-migrations";
import {
  ChainConcentratedPoolResponse,
  ChainPositionResponse,
  findMigration,
  getMigrationEligibility,
  MigrationEligibility,
  MigrationPoolState,
  MigrationRevalidation,
  poolStateFromChainResponse,
  PositionMigrationsResponse,
  positionStateFromChainResponse,
  validatePositionMigrationsResponse,
} from "~/utils/position-migrations";
import { api } from "~/utils/trpc";

/**
 * Hedged client over every configured Osmosis LCD, so the safety recheck is
 * neither stuck behind one hanging endpoint nor dependent on one healthy one.
 * Built lazily: the chain list is static, but the constructor throws on an
 * empty endpoint set, which must read as "cannot check", not as a crash.
 */
let lcdClient: MultiEndpointClient | undefined;
const getLcdClient = () => {
  if (lcdClient) return lcdClient;
  const endpoints = (ChainList[0].apis?.rest ?? []).map(({ address }) => ({
    address: address.replace(/\/+$/, ""),
  }));
  if (endpoints.length === 0) return undefined;
  lcdClient = createMultiEndpointClient(endpoints);
  return lcdClient;
};

/**
 * Reads one pool straight from the chain's LCD, bypassing react-query's
 * client cache, the server's short-lived pool cache, and (via `no-store`)
 * the browser's own HTTP cache: a safety recheck served from any cache is
 * not a recheck. The client hedges across every configured endpoint with
 * per-attempt timeouts, so one dead LCD neither blocks confirmation nor
 * fails it. Any failure resolves to `undefined`, which callers treat as
 * ineligible rather than falling back to cached state.
 */
const fetchChainPoolState = async (
  poolId: string
): Promise<MigrationPoolState | undefined> => {
  const client = getLcdClient();
  if (!client) return undefined;
  try {
    const { pool } = await client.fetch<{
      pool?: ChainConcentratedPoolResponse;
    }>(`/osmosis/poolmanager/v1beta1/pools/${poolId}`, { cache: "no-store" });
    return poolStateFromChainResponse(pool);
  } catch {
    return undefined;
  }
};

/**
 * Reads the position itself from the chain, uncached, the same way the pools
 * are read. The render-time amounts are a snapshot: a price crossing out of
 * the range while the modal sits open turns a two-sided position single-sided,
 * which the sizing path cannot handle, and the position may also have been
 * withdrawn or transferred. Any failure resolves to `undefined`, which callers
 * treat as ineligible.
 */
const fetchChainPositionState = async (
  positionId: string,
  expectedPoolId: string
) => {
  const client = getLcdClient();
  if (!client) return undefined;
  try {
    const response = await client.fetch<ChainPositionResponse>(
      `/osmosis/concentratedliquidity/v1beta1/position_by_id?position_id=${positionId}`,
      { cache: "no-store" }
    );
    return positionStateFromChainResponse(response, expectedPoolId);
  } catch {
    return undefined;
  }
};

/**
 * Resolves whether one concentrated liquidity position may migrate to its
 * alloyed-`USDC` counterpart, fetching the destination pool only when the
 * fe-content map actually pairs this pool.
 *
 * Every condition is re-checked against live pool state, so a map entry that
 * has drifted from the chain refuses rather than authorizing a migration onto
 * a different fee tier, tick spacing, or denom ordering.
 */
export const usePositionMigrationForPosition = ({
  poolId,
  positionId,
  positionValueUsd,
  positionAmounts,
  positionTicks,
  lockStateKnown,
  isUnbonding,
  isSuperfluidStaked,
  isSuperfluidUnstaking,
}: {
  poolId: string;
  /** Re-read from the chain at confirm time, so a range crossing while the
   * modal sits open is caught before the transaction is built. */
  positionId: string;
  /** USD value of the position; the divergence gate tightens with size. */
  positionValueUsd: number;
  /**
   * Raw base-unit amounts each side currently holds; a zero side means the
   * position sits outside its range and is refused (single-sided).
   */
  positionAmounts: { amount0: string; amount1: string };
  /** The position's raw ticks; a literal zero tick is refused. */
  positionTicks: { lowerTick: string; upperTick: string };
  /**
   * Whether the lock flags below come from successfully loaded position
   * details. While they are missing or errored, nothing is offered: a locked
   * position must never look migratable because its details failed to load.
   */
  lockStateKnown: boolean;
  isUnbonding: boolean;
  isSuperfluidStaked: boolean;
  isSuperfluidUnstaking: boolean;
}) => {
  const { migrations, priceDivergenceTiers, minAmountTolerance } =
    usePositionMigrations();

  // Destructured to scalars so the object literals callers pass each render
  // do not churn the revalidate callback's identity.
  const { amount0, amount1 } = positionAmounts;
  const { lowerTick, upperTick } = positionTicks;

  // Only the mapped source pools ever reach the destination query, so an
  // unmapped position costs no extra request.
  const mapped = findMigration({ migrations, fromPoolId: poolId });

  /**
   * Re-runs the full eligibility check against pool state read directly from
   * the chain's LCD, uncached. The render-time result below can be minutes
   * old by the time the user confirms, and even a "fresh" fetch through the
   * app's own pool query can be served by a short-lived server-side cache;
   * the transaction must not be built, or signed, against either. Returns
   * undefined when anything needed is missing, which callers must treat as
   * ineligible.
   */
  const revalidate = useCallback(async (): Promise<
    MigrationRevalidation | undefined
  > => {
    if (!mapped || !lockStateKnown) return undefined;

    /* The map is the kill switch and this runs right before real money
       moves: read the config fresh rather than from the render cache, so a
       pulled or corrupted entry stops a session already sitting in the
       modal, not just the next page load. */
    let freshConfig: PositionMigrationsResponse | undefined;
    try {
      freshConfig = validatePositionMigrationsResponse(
        await queryLatestPositionMigrations()
      );
    } catch {
      return undefined;
    }
    if (!freshConfig) return undefined;
    const freshMapped = findMigration({
      migrations: freshConfig.migrations,
      fromPoolId: poolId,
    });
    // The pairing this flow was opened for must still be the live pairing.
    if (!freshMapped || freshMapped.toPoolId !== mapped.toPoolId)
      return undefined;

    /* The position is re-read alongside the pools: its render-time amounts
       are a snapshot, and a price crossing out of the range while the modal
       sat open would otherwise pass the single-sided check here and fail
       later inside the sizing simulations. */
    const [fromPool, toPool, freshPosition] = await Promise.all([
      fetchChainPoolState(poolId),
      fetchChainPoolState(mapped.toPoolId.toString()),
      fetchChainPositionState(positionId, poolId),
    ]);
    if (!fromPool || !toPool || !freshPosition) return undefined;
    const eligibility: MigrationEligibility = getMigrationEligibility({
      migrations: freshConfig.migrations,
      priceDivergenceTiers: freshConfig.priceDivergenceTiers,
      positionValueUsd,
      positionAmounts: freshPosition.positionAmounts,
      positionTicks: freshPosition.positionTicks,
      fromPool,
      toPool,
      lockState: { isUnbonding, isSuperfluidStaked, isSuperfluidUnstaking },
      fromUsdcDenom: USDC_NOBLE_DENOM,
      toUsdcDenom: USDC_ALLOYED_DENOM,
    });
    return {
      eligibility,
      minAmountTolerance: freshConfig.minAmountTolerance,
    };
  }, [
    mapped,
    lockStateKnown,
    positionValueUsd,
    positionId,
    poolId,
    isUnbonding,
    isSuperfluidStaked,
    isSuperfluidUnstaking,
  ]);

  /* Poll while a mapped position's card is expanded, so the displayed
     divergence and the Migrate button's presence track the market instead of
     freezing at whatever the pools looked like on mount. Display only: the
     transaction path never trusts these - the confirm-time and pre-broadcast
     rechecks read the chain uncached. */
  const POOL_REFETCH_INTERVAL_MS = 15_000;
  const { data: fromPoolData, isFetching: isFetchingFromPool } =
    api.local.pools.getPool.useQuery(
      { poolId },
      { enabled: Boolean(mapped), refetchInterval: POOL_REFETCH_INTERVAL_MS }
    );
  const { data: toPoolData, isFetching: isFetchingToPool } =
    api.local.pools.getPool.useQuery(
      { poolId: mapped?.toPoolId.toString() ?? "" },
      { enabled: Boolean(mapped), refetchInterval: POOL_REFETCH_INTERVAL_MS }
    );

  /* True while either pool is being refetched: the displayed eligibility may
     be about to change, so callers disable the migrate actions rather than
     letting the user act on a number mid-update. */
  const isPoolDataRefetching = isFetchingFromPool || isFetchingToPool;

  if (
    !mapped ||
    !lockStateKnown ||
    priceDivergenceTiers === undefined ||
    minAmountTolerance === undefined ||
    !fromPoolData ||
    !toPoolData
  ) {
    return {
      migration: undefined,
      mappedMigration: mapped,
      eligibility: undefined,
      revalidate,
      isPoolDataRefetching,
    };
  }

  const fromPool = toMigrationPoolState(fromPoolData);
  const toPool = toMigrationPoolState(toPoolData);

  // A pool whose raw payload lacks the concentrated fields cannot be checked,
  // so it is not offered rather than being checked against defaults.
  if (!fromPool || !toPool)
    return {
      migration: undefined,
      mappedMigration: mapped,
      eligibility: undefined,
      revalidate,
      isPoolDataRefetching,
    };

  const eligibility: MigrationEligibility = getMigrationEligibility({
    migrations,
    priceDivergenceTiers,
    positionValueUsd,
    positionAmounts: { amount0, amount1 },
    positionTicks: { lowerTick, upperTick },
    fromPool,
    toPool,
    lockState: { isUnbonding, isSuperfluidStaked, isSuperfluidUnstaking },
    fromUsdcDenom: USDC_NOBLE_DENOM,
    toUsdcDenom: USDC_ALLOYED_DENOM,
  });

  return {
    migration: eligibility.isEligible ? eligibility.migration : undefined,
    /**
     * The map entry regardless of live eligibility. An open modal mounts on
     * this rather than on `migration`, so a divergence drifting out of
     * tolerance mid-flow disables the action instead of unmounting the modal
     * under the user - potentially mid-signing.
     */
    mappedMigration: mapped,
    eligibility,
    minAmountTolerance,
    toPool,
    revalidate,
    isPoolDataRefetching,
  };
};

/**
 * Narrows a pool to the fields the eligibility checks need, or `undefined`
 * when it is not a concentrated pool carrying them.
 */
const toMigrationPoolState = (pool: {
  id: string;
  type: string;
  raw: unknown;
  spreadFactor: { toDec: () => Dec };
}): MigrationPoolState | undefined => {
  const raw = pool.raw as Partial<ConcentratedPoolRawResponse>;
  if (
    !raw?.token0 ||
    !raw?.token1 ||
    !raw?.current_sqrt_price ||
    !raw?.tick_spacing ||
    !raw?.spread_factor
  )
    return undefined;

  // A malformed price must read as "cannot check" rather than throw
  // mid-render, and a non-positive one must not masquerade as valid once the
  // divergence check squares it.
  let currentSqrtPrice: Dec;
  try {
    currentSqrtPrice = new Dec(raw.current_sqrt_price);
  } catch {
    return undefined;
  }
  if (!currentSqrtPrice.isPositive()) return undefined;

  return {
    id: pool.id,
    type: pool.type,
    token0: raw.token0,
    token1: raw.token1,
    // Compared as the chain's own decimal string, so the check never depends
    // on how a formatter renders the rate.
    spreadFactor: raw.spread_factor,
    tickSpacing: Number(raw.tick_spacing),
    currentSqrtPrice,
  };
};
