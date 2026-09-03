import type { ConcentratedPoolRawResponse } from "@osmosis-labs/server";
import { Dec } from "@osmosis-labs/unit";

import {
  USDC_ALLOYED_DENOM,
  USDC_NOBLE_DENOM,
} from "~/config/position-migration";
import { usePositionMigrations } from "~/hooks/use-position-migrations";
import {
  findMigration,
  getMigrationEligibility,
  MigrationEligibility,
  MigrationPoolState,
} from "~/utils/position-migrations";
import { api } from "~/utils/trpc";

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
  isUnbonding,
  isSuperfluidStaked,
  isSuperfluidUnstaking,
}: {
  poolId: string;
  isUnbonding: boolean;
  isSuperfluidStaked: boolean;
  isSuperfluidUnstaking: boolean;
}) => {
  const { migrations, priceDivergenceTolerance, minAmountTolerance } =
    usePositionMigrations();

  // Only the mapped source pools ever reach the destination query, so an
  // unmapped position costs no extra request.
  const mapped = findMigration({ migrations, fromPoolId: poolId });

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
    priceDivergenceTolerance === undefined ||
    minAmountTolerance === undefined ||
    !fromPoolData ||
    !toPoolData
  ) {
    return { migration: undefined, eligibility: undefined };
  }

  const fromPool = toMigrationPoolState(fromPoolData);
  const toPool = toMigrationPoolState(toPoolData);

  // A pool whose raw payload lacks the concentrated fields cannot be checked,
  // so it is not offered rather than being checked against defaults.
  if (!fromPool || !toPool)
    return { migration: undefined, eligibility: undefined };

  const eligibility: MigrationEligibility = getMigrationEligibility({
    migrations,
    priceDivergenceTolerance,
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
