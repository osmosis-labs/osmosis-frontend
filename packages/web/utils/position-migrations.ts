import { tickToSqrtPrice } from "@osmosis-labs/math";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";

/**
 * A curated 1:1 link from a `USDC.noble`-paired concentrated liquidity pool to
 * its alloyed-`USDC` equivalent, as authored in the osmosis-labs/fe-content
 * repo. Presence in the map is what makes the migrate action available, so an
 * absent or empty list turns the feature off entirely.
 * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/position-migrations.json
 */
export interface PositionMigration {
  fromPoolId: number;
  toPoolId: number;
  /**
   * The spread factor both pools are expected to share, as the decimal string
   * the chain reports. Authoring intent only: always re-checked against live
   * pool state, since a stale value here must never be able to authorize a
   * migration onto a different fee tier.
   */
  spreadFactor: string;
  /** The tick spacing both pools are expected to share. Re-checked live. */
  tickSpacing: number;
  /** Why this destination was chosen. Never shown in the UI. */
  note?: string;
  /** Defaults to true when omitted. */
  enabled?: boolean;
}

/**
 * One rung of the size-tiered divergence gate: positions worth strictly less
 * than `upToUsd` gate at `tolerancePercent`. The final tier omits `upToUsd`
 * and catches everything above.
 */
export interface DivergenceTier {
  upToUsd?: number;
  tolerancePercent: number;
}

export interface PositionMigrationsResponse {
  /**
   * Maximum allowed difference, in percent, between the source and
   * destination pool prices, tiered by the USD value of the position being
   * migrated: a small position can tolerate more mispricing because the
   * absolute loss is small, while a large one demands a tight price.
   */
  priceDivergenceTiers: DivergenceTier[];
  /**
   * Tolerance, in percent, for deriving `tokenMinAmount0/1` from the
   * simulated deposit amounts.
   */
  minAmountTolerance: number;
  migrations: PositionMigration[];
}

/** Pool fields the eligibility checks need, from either pool. */
export interface MigrationPoolState {
  id: string;
  /** `"concentrated"` for every pool this flow can touch. */
  type: string;
  token0: string;
  token1: string;
  spreadFactor: string;
  tickSpacing: number;
  currentSqrtPrice: Dec;
}

/**
 * Why a migration is unavailable. Each value is a distinct user-facing
 * message, and every one of them is a refusal: there is no case where the
 * flow proceeds with an adjustment or a warning.
 */
export type MigrationIneligibilityReason =
  /** No entry in the CMS map, or the entry is explicitly disabled. */
  | "notMapped"
  /** One or both pools are not concentrated liquidity. */
  | "notConcentrated"
  /**
   * Tick spacing differs, so the source ticks cannot be copied as raw
   * integers. Re-deriving them through price is deliberately not implemented.
   */
  | "tickSpacingMismatch"
  /**
   * Fee tier differs. This is a like-for-like move, so a differing spread
   * factor means a different pool, not the same pool with a disclosure.
   */
  | "spreadFactorMismatch"
  /**
   * The pools order their denoms oppositely, so identical tick integers would
   * describe an inverted price range.
   */
  | "denomOrderFlipped"
  /** Destination price is further from the source than the tolerance allows. */
  | "priceDivergence"
  /** Locked, superfluid-staked, or unbonding positions cannot be withdrawn. */
  | "positionLocked"
  /**
   * A pool does not hold the USDC denom the migration is defined in terms of,
   * or the two pools' non-USDC assets are different denoms. Indicates a
   * mis-authored map entry rather than anything the user can act on.
   */
  | "unexpectedDenoms";

export type MigrationEligibility =
  | {
      isEligible: true;
      migration: PositionMigration;
      divergencePercent: Dec;
      /** The tier tolerance this position was judged against. */
      appliedTolerancePercent: number;
    }
  | {
      isEligible: false;
      reason: MigrationIneligibilityReason;
      /** Present when the refusal is a price divergence. */
      divergencePercent?: Dec;
      appliedTolerancePercent?: number;
    };

/**
 * Lock state as derived per position by the concentrated-liquidity queries.
 *
 * Read these three booleans rather than the collapsed `PositionStatus`:
 * `calcPositionStatus` resolves to a single value through a precedence chain,
 * so a full-range superfluid position reports only `"superfluidStaked"` and a
 * status check would silently depend on that ordering.
 */
export interface PositionLockState {
  isUnbonding: boolean;
  isSuperfluidStaked: boolean;
  isSuperfluidUnstaking: boolean;
}

export const isPositionUnlocked = ({
  isUnbonding,
  isSuperfluidStaked,
  isSuperfluidUnstaking,
}: PositionLockState) =>
  !isUnbonding && !isSuperfluidStaked && !isSuperfluidUnstaking;

/** Finds the enabled mapping for a source pool, if any. */
export const findMigration = ({
  migrations,
  fromPoolId,
}: {
  migrations: PositionMigration[] | undefined;
  fromPoolId: string;
}) =>
  migrations?.find(
    (migration) =>
      migration.fromPoolId.toString() === fromPoolId &&
      migration.enabled !== false
  );

/**
 * The divergence tolerance a position of the given USD value gates at: the
 * first tier whose bound exceeds the value, else the catch-all. Returns
 * `undefined` for an empty or malformed tier list (no catch-all), which the
 * caller must treat as "cannot evaluate the gate" and refuse - defaulting to
 * any tolerance here would let a config mistake loosen the gate silently.
 */
export const toleranceForPositionSize = (
  tiers: DivergenceTier[] | undefined,
  positionValueUsd: number
): number | undefined => {
  if (!tiers?.length) return undefined;
  for (const tier of tiers) {
    if (tier.upToUsd === undefined) return tier.tolerancePercent;
    if (positionValueUsd < tier.upToUsd) return tier.tolerancePercent;
  }
  return undefined;
};

/**
 * Which side of a pool holds the given denom, or `undefined` if neither does.
 * Matched on the full minimal denom so an `ibc/HASH` is never conflated with
 * another asset that happens to share a symbol.
 */
const getUsdcIndex = (pool: MigrationPoolState, usdcDenom: string) => {
  if (pool.token0 === usdcDenom) return 0;
  if (pool.token1 === usdcDenom) return 1;
  return undefined;
};

/**
 * Difference between the two pools' current prices, as a percentage of the
 * source price. Price is `sqrtPrice²`, and comparing prices rather than ticks
 * keeps this independent of tick spacing.
 */
export const getPriceDivergencePercent = ({
  fromPool,
  toPool,
}: {
  fromPool: MigrationPoolState;
  toPool: MigrationPoolState;
}) => {
  const fromPrice = fromPool.currentSqrtPrice.mul(fromPool.currentSqrtPrice);
  const toPrice = toPool.currentSqrtPrice.mul(toPool.currentSqrtPrice);

  // A zero source price would make the ratio meaningless. Treat it as maximal
  // divergence so the caller refuses rather than dividing by zero.
  if (fromPrice.isZero()) return new Dec(Number.MAX_SAFE_INTEGER);

  const difference = toPrice.sub(fromPrice);
  return (difference.isNegative() ? difference.neg() : difference)
    .quo(fromPrice)
    .mul(new Dec(100));
};

/**
 * Decides whether one position may migrate, checking every condition that
 * must hold rather than short-circuiting on the first: the pinned CMS values
 * are treated as intent and re-verified against live pool state, because a
 * stale entry must not be able to authorize a migration onto a different fee
 * tier or tick spacing.
 */
export const getMigrationEligibility = ({
  migrations,
  priceDivergenceTiers,
  positionValueUsd,
  fromPool,
  toPool,
  lockState,
  fromUsdcDenom,
  toUsdcDenom,
}: {
  migrations: PositionMigration[] | undefined;
  priceDivergenceTiers: DivergenceTier[] | undefined;
  /** USD value of the position being migrated; selects the divergence tier. */
  positionValueUsd: number;
  fromPool: MigrationPoolState;
  toPool: MigrationPoolState | undefined;
  lockState: PositionLockState;
  /** The USDC denom expected in the source pool, e.g. `USDC.noble`. */
  fromUsdcDenom: string;
  /** The USDC denom expected in the destination pool, i.e. the alloy. */
  toUsdcDenom: string;
}): MigrationEligibility => {
  const migration = findMigration({ migrations, fromPoolId: fromPool.id });
  if (!migration) return { isEligible: false, reason: "notMapped" };

  // The destination pool must resolve to the mapped id; a map pointing at a
  // pool we cannot load is not a usable migration.
  if (!toPool || toPool.id !== migration.toPoolId.toString())
    return { isEligible: false, reason: "notMapped" };

  if (!isPositionUnlocked(lockState))
    return { isEligible: false, reason: "positionLocked" };

  if (fromPool.type !== "concentrated" || toPool.type !== "concentrated")
    return { isEligible: false, reason: "notConcentrated" };

  // Ticks are copied as raw integers, which is only meaningful at identical
  // spacing. Checked against live state and against the pinned value, so a
  // CMS entry that has drifted from the chain refuses instead of proceeding.
  if (
    fromPool.tickSpacing !== toPool.tickSpacing ||
    fromPool.tickSpacing !== migration.tickSpacing
  )
    return { isEligible: false, reason: "tickSpacingMismatch" };

  if (
    fromPool.spreadFactor !== toPool.spreadFactor ||
    fromPool.spreadFactor !== migration.spreadFactor
  )
    return { isEligible: false, reason: "spreadFactorMismatch" };

  // Identical tick integers only describe the same price range when both
  // pools order their denoms the same way. The USDC side is the one that
  // changes, so locate it by denom in each pool and require the other
  // (shared) asset to occupy the same index on both sides.
  const fromUsdcIndex = getUsdcIndex(fromPool, fromUsdcDenom);
  const toUsdcIndex = getUsdcIndex(toPool, toUsdcDenom);
  if (fromUsdcIndex === undefined || toUsdcIndex === undefined)
    return { isEligible: false, reason: "unexpectedDenoms" };
  if (fromUsdcIndex !== toUsdcIndex)
    return { isEligible: false, reason: "denomOrderFlipped" };

  // The non-USDC asset must be literally the same denom, matched in full so
  // an IBC hash is never conflated with another asset sharing its symbol.
  const fromSharedDenom =
    fromUsdcIndex === 0 ? fromPool.token1 : fromPool.token0;
  const toSharedDenom = toUsdcIndex === 0 ? toPool.token1 : toPool.token0;
  if (fromSharedDenom !== toSharedDenom)
    return { isEligible: false, reason: "unexpectedDenoms" };

  // The gate tightens with position size. An unevaluable tier list (empty, or
  // missing its catch-all) refuses rather than assuming a tolerance: a config
  // mistake must never loosen the gate.
  const tolerancePercent = toleranceForPositionSize(
    priceDivergenceTiers,
    positionValueUsd
  );
  if (tolerancePercent === undefined)
    return { isEligible: false, reason: "priceDivergence" };

  const divergencePercent = getPriceDivergencePercent({ fromPool, toPool });
  if (divergencePercent.gt(new Dec(tolerancePercent.toString())))
    return {
      isEligible: false,
      reason: "priceDivergence",
      divergencePercent,
      appliedTolerancePercent: tolerancePercent,
    };

  return {
    isEligible: true,
    migration,
    divergencePercent,
    appliedTolerancePercent: tolerancePercent,
  };
};

/**
 * Floors a simulated deposit amount into the `tokenMinAmount` the create
 * message carries.
 *
 * These minimums are the only onchain protection: with them the create fails
 * and the batched withdraw reverts with it, leaving the original position
 * untouched, while at zero a mispriced create succeeds silently. They are
 * derived from simulated amounts rather than from the price tolerance because
 * the two are different quantities: for a fixed tick range an adverse price
 * move reduces one side's required amount while raising the other's, so a
 * single percentage of price would be too tight on one side and too loose on
 * the other.
 *
 * The tolerance is therefore looser than the price gate on purpose. It only
 * absorbs pool state moving between simulation and broadcast; the gate is
 * what judges whether the destination is soundly priced.
 */
export const deriveTokenMinAmount = ({
  simulatedAmount,
  minAmountTolerance,
}: {
  simulatedAmount: Int;
  minAmountTolerance: number;
}) => {
  if (!simulatedAmount.isPositive()) return new Int(0);

  const kept = new Dec(simulatedAmount).mul(
    new Dec(1).sub(new Dec(minAmountTolerance.toString()).quo(new Dec(100)))
  );

  // Never round up to more than was simulated, which would revert on the
  // nose, and never return 0 for a position that did deposit something: a
  // zero minimum is exactly the silent-success case these guard against.
  const floored = kept.truncate();
  return floored.isPositive() ? floored : new Int(1);
};

/**
 * The most a full withdrawal of the position can pay out per side at ANY
 * price: all of token0 with the price at the range's lower edge
 * (`L·(1/√pl − 1/√pu)`), all of token1 at the upper edge (`L·(√pu − √pl)`).
 *
 * The migration sizes its swap and create 0.5% under a fresh withdrawal
 * simulation, so these edge amounts are a true ceiling on what the
 * transaction can spend of each denom - and therefore on what it could draw
 * from the wallet if the withdrawal under-delivers - independent of where
 * prices move between simulation and inclusion. A snapshot of the position's
 * current composition is NOT such a ceiling: both pools can move together
 * without tripping the divergence gate, pushing one side's sized amount past
 * what the snapshot showed. Rounded up, because a disclosed cap must never
 * understate. Returns `undefined` for a malformed position, which callers
 * must treat as "cannot disclose" rather than showing nothing silently.
 */
export const getRangeMaxWithdrawAmounts = ({
  liquidity,
  lowerTick,
  upperTick,
}: {
  /** The position's liquidity, as the chain reports it (decimal string). */
  liquidity: string;
  lowerTick: Int;
  upperTick: Int;
}):
  | { maxAmount0: Int; maxAmount1: Int; isInformative: boolean }
  | undefined => {
  let liquidityDec: Dec;
  try {
    liquidityDec = new Dec(liquidity);
  } catch {
    return undefined;
  }
  if (!liquidityDec.isPositive() || !lowerTick.lt(upperTick)) return undefined;

  const sqrtPriceLower = tickToSqrtPrice(lowerTick);
  const sqrtPriceUpper = tickToSqrtPrice(upperTick);
  if (!sqrtPriceLower.isPositive() || !sqrtPriceUpper.isPositive())
    return undefined;

  const ceil = (d: Dec) => {
    const truncated = d.truncate();
    return new Dec(truncated).equals(d) ? truncated : truncated.add(new Int(1));
  };

  return {
    maxAmount0: ceil(
      liquidityDec.mul(
        new Dec(1).quo(sqrtPriceLower).sub(new Dec(1).quo(sqrtPriceUpper))
      )
    ),
    maxAmount1: ceil(liquidityDec.mul(sqrtPriceUpper.sub(sqrtPriceLower))),
    /* The edge maxima are only worth displaying for ranges the price could
       plausibly traverse. For a full-range position the edges sit at 10^-12
       and 10^38, so the "maximums" come out at astronomically meaningless
       figures (billions of OSMO on a $50 position); there the bank-enforced
       wallet-balance bound is the one worth words. Wider than 100x between
       the bounds (sqrt ratio > 10) is treated as uninformative. */
    isInformative: sqrtPriceUpper.quo(sqrtPriceLower).lte(new Dec(10)),
  };
};

/**
 * Pool fields as the chain's own LCD returns them from
 * `/osmosis/poolmanager/v1beta1/pools/{id}` - the uncached source the final
 * pre-broadcast safety check reads, bypassing every cache between this app
 * and the chain.
 */
export interface ChainConcentratedPoolResponse {
  "@type"?: string;
  id?: string;
  token0?: string;
  token1?: string;
  current_sqrt_price?: string;
  tick_spacing?: string;
  spread_factor?: string;
}

const CONCENTRATED_POOL_TYPE_URL =
  "/osmosis.concentratedliquidity.v1beta1.Pool";

/**
 * Narrows a raw chain pool response into the state the eligibility checks
 * take, or `undefined` when it is not a concentrated pool carrying every
 * needed field - which callers must treat as "cannot evaluate" and refuse.
 *
 * The chain reports `current_sqrt_price` as a 36-decimal big-dec string,
 * which the 18-decimal `Dec` refuses to parse, so the fraction is truncated
 * to 18 digits: sub-attoprecision cannot move a percentage-scale gate.
 */
export const poolStateFromChainResponse = (
  pool: ChainConcentratedPoolResponse | undefined
): MigrationPoolState | undefined => {
  if (
    !pool ||
    pool["@type"] !== CONCENTRATED_POOL_TYPE_URL ||
    !pool.id ||
    !pool.token0 ||
    !pool.token1 ||
    !pool.current_sqrt_price ||
    !pool.tick_spacing ||
    !pool.spread_factor
  )
    return undefined;

  const [whole, fraction = ""] = pool.current_sqrt_price.split(".");
  const sqrtPrice = fraction
    ? `${whole}.${fraction.slice(0, 18)}`
    : pool.current_sqrt_price;

  return {
    id: pool.id,
    type: "concentrated",
    token0: pool.token0,
    token1: pool.token1,
    spreadFactor: pool.spread_factor,
    tickSpacing: Number(pool.tick_spacing),
    currentSqrtPrice: new Dec(sqrtPrice),
  };
};

/**
 * Rounds a coin UP to the given number of display decimals, so a truncating
 * formatter can never show less than the true amount: 0.009999 USDC rendered
 * at two decimals truncates to 0.0099, understating a cap it is meant to
 * disclose, while ceiled first it renders as 0.01. A coin whose currency has
 * no more decimals than the display, or a non-positive amount, is returned
 * unchanged - there is nothing a truncation could drop.
 */
export const ceilCoinToDisplayDecimals = (
  coin: CoinPretty,
  displayDecimals: number
): CoinPretty => {
  const droppedDecimals = coin.currency.coinDecimals - displayDecimals;
  if (droppedDecimals <= 0) return coin;

  const amount = new Int(coin.toCoin().amount);
  if (!amount.isPositive()) return coin;

  // Ceiling division on positive integers: (a - 1) / step + 1, then scaled
  // back up so the amount is an exact multiple of the displayed precision.
  const step = new Int("1" + "0".repeat(droppedDecimals));
  const ceiledQuotient = amount.sub(new Int(1)).div(step).add(new Int(1));
  return new CoinPretty(coin.currency, ceiledQuotient.mul(step));
};

/**
 * Renders the disclosed wallet-draw cap: ceiled to the display precision,
 * then formatted with nothing that can drop a significant digit.
 *
 * The precision rule is `CoinUtils.shrinkDecimals`'s own - shed one decimal
 * per integer digit past the first, floor zero - so these figures shrink
 * with magnitude exactly like every shrink-formatted amount in the app
 * (5,329.268734 renders as 5,329.269 at a six-decimal cap, a nine-digit
 * amount as a bare integer, values below 1 at full precision). What it
 * deliberately does NOT reuse is shrink's rendering: `shrink`/`formatPretty`
 * truncate the fraction downward, so 1,234.56 at two decimals became 1,234
 * and understated the cap. Here the value is ceiled to the chosen precision
 * first, making the truncation a no-op: a cap rounded UP at any precision
 * can only overstate, never understate. `trim` only removes trailing zeros.
 */
export const formatWalletDrawCap = (
  coin: CoinPretty,
  maxDisplayDecimals: number
) => {
  const whole = coin.toDec().truncate();
  const wholeDigits = whole.isZero() ? 0 : whole.toString().length;
  const displayDecimals = Math.max(
    0,
    Math.min(maxDisplayDecimals, maxDisplayDecimals - wholeDigits + 1)
  );
  return ceilCoinToDisplayDecimals(coin, displayDecimals)
    .maxDecimals(displayDecimals)
    .trim(true)
    .toString();
};
