import type { ConcentratedPoolRawResponse } from "@osmosis-labs/server";
import { Dec } from "@osmosis-labs/unit";
import { useCallback } from "react";

import { ChainList } from "~/config/generated/chain-list";
import {
  USDC_ALLOYED_DENOM,
  USDC_NOBLE_DENOM,
} from "~/config/position-migration";
import { usePositionMigrations } from "~/hooks/use-position-migrations";
import {
  ChainConcentratedPoolResponse,
  findMigration,
  getMigrationEligibility,
  MigrationEligibility,
  MigrationPoolState,
  poolStateFromChainResponse,
} from "~/utils/position-migrations";
import { api } from "~/utils/trpc";

/**
 * Reads one pool straight from the chain's LCD, bypassing both react-query's
 * client cache and the server's short-lived pool cache: `staleTime: 0` only
 * defeats the former, and a safety recheck served from any cache is not a
 * recheck. Any failure resolves to `undefined`, which callers treat as
 * ineligible rather than falling back to cached state.
 */
const fetchChainPoolState = async (
  poolId: string
): Promise<MigrationPoolState | undefined> => {
  const rest = ChainList[0].apis?.rest[0]?.address;
  if (!rest) return undefined;
  try {
    const response = await fetch(
      `${rest.replace(/\/$/, "")}/osmosis/poolmanager/v1beta1/pools/${poolId}`
    );
    if (!response.ok) return undefined;
    const { pool } = (await response.json()) as {
      pool?: ChainConcentratedPoolResponse;
    };
    return poolStateFromChainResponse(pool);
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
  positionValueUsd,
  lockStateKnown,
  isUnbonding,
  isSuperfluidStaked,
  isSuperfluidUnstaking,
}: {
  poolId: string;
  /** USD value of the position; the divergence gate tightens with size. */
  positionValueUsd: number;
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
    MigrationEligibility | undefined
  > => {
    if (
      !mapped ||
      !lockStateKnown ||
      priceDivergenceTiers === undefined ||
      minAmountTolerance === undefined
    )
      return undefined;
    const [fromPool, toPool] = await Promise.all([
      fetchChainPoolState(poolId),
      fetchChainPoolState(mapped.toPoolId.toString()),
    ]);
    if (!fromPool || !toPool) return undefined;
    return getMigrationEligibility({
      migrations,
      priceDivergenceTiers,
      positionValueUsd,
      fromPool,
      toPool,
      lockState: { isUnbonding, isSuperfluidStaked, isSuperfluidUnstaking },
      fromUsdcDenom: USDC_NOBLE_DENOM,
      toUsdcDenom: USDC_ALLOYED_DENOM,
    });
  }, [
    mapped,
    lockStateKnown,
    migrations,
    priceDivergenceTiers,
    minAmountTolerance,
    positionValueUsd,
    poolId,
    isUnbonding,
    isSuperfluidStaked,
    isSuperfluidUnstaking,
  ]);

  const { data: fromPoolData } = api.local.pools.getPool.useQuery(
    { poolId },
    { enabled: Boolean(mapped) }
  );
  const { data: toPoolData } = api.local.pools.getPool.useQuery(
    { poolId: mapped?.toPoolId.toString() ?? "" },
    { enabled: Boolean(mapped) }
  );

  if (
    !mapped ||
    !lockStateKnown ||
    priceDivergenceTiers === undefined ||
    minAmountTolerance === undefined ||
    !fromPoolData ||
    !toPoolData
  ) {
    return { migration: undefined, eligibility: undefined, revalidate };
  }

  const fromPool = toMigrationPoolState(fromPoolData);
  const toPool = toMigrationPoolState(toPoolData);

  // A pool whose raw payload lacks the concentrated fields cannot be checked,
  // so it is not offered rather than being checked against defaults.
  if (!fromPool || !toPool)
    return { migration: undefined, eligibility: undefined, revalidate };

  const eligibility: MigrationEligibility = getMigrationEligibility({
    migrations,
    priceDivergenceTiers,
    positionValueUsd,
    fromPool,
    toPool,
    lockState: { isUnbonding, isSuperfluidStaked, isSuperfluidUnstaking },
    fromUsdcDenom: USDC_NOBLE_DENOM,
    toUsdcDenom: USDC_ALLOYED_DENOM,
  });

  return {
    migration: eligibility.isEligible ? eligibility.migration : undefined,
    eligibility,
    minAmountTolerance,
    toPool,
    revalidate,
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

  return {
    id: pool.id,
    type: pool.type,
    token0: raw.token0,
    token1: raw.token1,
    // Compared as the chain's own decimal string, so the check never depends
    // on how a formatter renders the rate.
    spreadFactor: raw.spread_factor,
    tickSpacing: Number(raw.tick_spacing),
    currentSqrtPrice: new Dec(raw.current_sqrt_price),
  };
};
