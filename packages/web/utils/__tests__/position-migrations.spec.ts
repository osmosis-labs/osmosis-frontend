import { Dec, Int } from "@osmosis-labs/unit";

import {
  ChainConcentratedPoolResponse,
  deriveTokenMinAmount,
  DivergenceTier,
  findMigration,
  getMigrationEligibility,
  getPriceDivergencePercent,
  isPositionUnlocked,
  MigrationPoolState,
  poolStateFromChainResponse,
  PositionMigration,
  toleranceForPositionSize,
} from "../position-migrations";

const USDC_NOBLE =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
const ALL_USDC =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";
const USDY =
  "ibc/23104D411A6EB6031FA92FB75F227422B84989969E91DCAD56A535DD7FF0A373";

/** Mirrors pool 1926 -> 3501, the largest real pairing. */
const MIGRATION: PositionMigration = {
  fromPoolId: 1926,
  toPoolId: 3501,
  spreadFactor: "0.000100000000000000",
  tickSpacing: 100,
};

const fromPool = (overrides: Partial<MigrationPoolState> = {}) => ({
  id: "1926",
  type: "concentrated",
  token0: USDY,
  token1: USDC_NOBLE,
  spreadFactor: "0.000100000000000000",
  tickSpacing: 100,
  currentSqrtPrice: new Dec("0.001"),
  ...overrides,
});

const toPool = (overrides: Partial<MigrationPoolState> = {}) => ({
  id: "3501",
  type: "concentrated",
  token0: USDY,
  token1: ALL_USDC,
  spreadFactor: "0.000100000000000000",
  tickSpacing: 100,
  currentSqrtPrice: new Dec("0.001"),
  ...overrides,
});

const unlocked = {
  isUnbonding: false,
  isSuperfluidStaked: false,
  isSuperfluidUnstaking: false,
};

const TIERS: DivergenceTier[] = [
  { upToUsd: 100, tolerancePercent: 0.5 },
  { upToUsd: 500, tolerancePercent: 0.3 },
  { upToUsd: 1000, tolerancePercent: 0.2 },
  { tolerancePercent: 0.1 },
];

const check = (args: {
  from?: Partial<MigrationPoolState>;
  to?: Partial<MigrationPoolState>;
  lockState?: typeof unlocked;
  migrations?: PositionMigration[];
  tiers?: DivergenceTier[];
  positionValueUsd?: number;
}) =>
  getMigrationEligibility({
    migrations: args.migrations ?? [MIGRATION],
    priceDivergenceTiers: args.tiers ?? TIERS,
    positionValueUsd: args.positionValueUsd ?? 5000,
    fromPool: fromPool(args.from),
    toPool: toPool(args.to),
    lockState: args.lockState ?? unlocked,
    fromUsdcDenom: USDC_NOBLE,
    toUsdcDenom: ALL_USDC,
  });

describe("getMigrationEligibility", () => {
  it("allows a like-for-like pairing at matching price", () => {
    const result = check({});
    expect(result.isEligible).toBe(true);
  });

  it("refuses a pool with no map entry", () => {
    const result = check({ migrations: [] });
    expect(result).toMatchObject({ isEligible: false, reason: "notMapped" });
  });

  it("refuses an entry that is explicitly disabled", () => {
    const result = check({ migrations: [{ ...MIGRATION, enabled: false }] });
    expect(result).toMatchObject({ isEligible: false, reason: "notMapped" });
  });

  it("treats a missing `enabled` as enabled", () => {
    const { enabled, ...withoutFlag } = { ...MIGRATION, enabled: true };
    expect(check({ migrations: [withoutFlag] }).isEligible).toBe(true);
  });

  // A differing fee tier means a different pool, not the same pool with a
  // disclosure, so this is a refusal rather than a warning.
  it("refuses a spread factor mismatch between the pools", () => {
    const result = check({ to: { spreadFactor: "0.001000000000000000" } });
    expect(result).toMatchObject({
      isEligible: false,
      reason: "spreadFactorMismatch",
    });
  });

  // The pinned CMS value must never be able to authorize a migration that
  // live pool state contradicts, even when both pools agree with each other.
  it("refuses when both pools agree but disagree with the pinned spread factor", () => {
    const result = check({
      from: { spreadFactor: "0.002000000000000000" },
      to: { spreadFactor: "0.002000000000000000" },
    });
    expect(result).toMatchObject({
      isEligible: false,
      reason: "spreadFactorMismatch",
    });
  });

  it("refuses a tick spacing mismatch between the pools", () => {
    const result = check({ to: { tickSpacing: 1000 } });
    expect(result).toMatchObject({
      isEligible: false,
      reason: "tickSpacingMismatch",
    });
  });

  it("refuses when both pools agree but disagree with the pinned tick spacing", () => {
    const result = check({
      from: { tickSpacing: 1000 },
      to: { tickSpacing: 1000 },
    });
    expect(result).toMatchObject({
      isEligible: false,
      reason: "tickSpacingMismatch",
    });
  });

  // Copying tick integers into a pool that orders its denoms oppositely would
  // invert the user's price range, which is the costliest silent failure here.
  it("refuses a denom order flip", () => {
    const result = check({ to: { token0: ALL_USDC, token1: USDY } });
    expect(result).toMatchObject({
      isEligible: false,
      reason: "denomOrderFlipped",
    });
  });

  it("allows a consistent flip on both sides", () => {
    const result = check({
      from: { token0: USDC_NOBLE, token1: USDY },
      to: { token0: ALL_USDC, token1: USDY },
    });
    expect(result.isEligible).toBe(true);
  });

  it("refuses when the pools' non-USDC assets are different denoms", () => {
    const result = check({ to: { token0: `${USDY}-other` } });
    expect(result).toMatchObject({
      isEligible: false,
      reason: "unexpectedDenoms",
    });
  });

  it("refuses when the source pool does not hold the expected USDC denom", () => {
    const result = check({ from: { token1: ALL_USDC } });
    expect(result).toMatchObject({
      isEligible: false,
      reason: "unexpectedDenoms",
    });
  });

  it("refuses a non-concentrated pool", () => {
    const result = check({ to: { type: "weighted" } });
    expect(result).toMatchObject({
      isEligible: false,
      reason: "notConcentrated",
    });
  });

  it.each([
    ["unbonding", { ...unlocked, isUnbonding: true }],
    ["superfluid staked", { ...unlocked, isSuperfluidStaked: true }],
    ["superfluid unstaking", { ...unlocked, isSuperfluidUnstaking: true }],
  ])("refuses a %s position", (_label, lockState) => {
    const result = check({ lockState });
    expect(result).toMatchObject({
      isEligible: false,
      reason: "positionLocked",
    });
  });

  it("refuses when the destination id does not match the mapped id", () => {
    const result = check({ to: { id: "9999" } });
    expect(result).toMatchObject({ isEligible: false, reason: "notMapped" });
  });

  describe("size-tiered price divergence", () => {
    // sqrtPrice 0.001 -> price 1e-6; 0.0010019 -> ~0.38% divergence: allowed
    // for a small position, refused for a large one.
    const drifted = { currentSqrtPrice: new Dec("0.0010019") };

    it("lets a small position through a divergence a large one refuses", () => {
      expect(check({ to: drifted, positionValueUsd: 50 }).isEligible).toBe(
        true
      );
      const large = check({ to: drifted, positionValueUsd: 5000 });
      expect(large).toMatchObject({
        isEligible: false,
        reason: "priceDivergence",
        appliedTolerancePercent: 0.1,
      });
    });

    it("applies the tier boundary as strictly-less-than", () => {
      // exactly $100 falls into the $100-500 tier (0.3%), not the 0.5% one
      const mid = check({ to: drifted, positionValueUsd: 100 });
      expect(mid).toMatchObject({
        isEligible: false,
        appliedTolerancePercent: 0.3,
      });
    });

    it("refuses when the tier list is empty rather than assuming a tolerance", () => {
      const result = check({ tiers: [], positionValueUsd: 50 });
      expect(result).toMatchObject({
        isEligible: false,
        reason: "priceDivergence",
      });
    });

    it("refuses when no catch-all exists and the value exceeds every bound", () => {
      const result = check({
        tiers: [{ upToUsd: 100, tolerancePercent: 0.5 }],
        positionValueUsd: 5000,
      });
      expect(result).toMatchObject({
        isEligible: false,
        reason: "priceDivergence",
      });
    });
  });

  describe("price divergence", () => {
    // sqrtPrice 0.001 -> price 1e-6; 0.0010005 -> ~1.001e-6, i.e. ~0.1%.
    it("allows divergence within tolerance", () => {
      const result = check({ to: { currentSqrtPrice: new Dec("0.0010004") } });
      expect(result.isEligible).toBe(true);
    });

    it("refuses divergence beyond tolerance", () => {
      const result = check({ to: { currentSqrtPrice: new Dec("0.0011") } });
      expect(result).toMatchObject({
        isEligible: false,
        reason: "priceDivergence",
      });
    });

    it("refuses divergence in either direction", () => {
      const result = check({ to: { currentSqrtPrice: new Dec("0.0009") } });
      expect(result).toMatchObject({
        isEligible: false,
        reason: "priceDivergence",
      });
    });

    it("refuses rather than dividing by a zero source price", () => {
      const result = check({ from: { currentSqrtPrice: new Dec(0) } });
      expect(result).toMatchObject({
        isEligible: false,
        reason: "priceDivergence",
      });
    });
  });
});

describe("toleranceForPositionSize", () => {
  it("selects the first tier whose bound exceeds the value", () => {
    expect(toleranceForPositionSize(TIERS, 50)).toBe(0.5);
    expect(toleranceForPositionSize(TIERS, 100)).toBe(0.3);
    expect(toleranceForPositionSize(TIERS, 499)).toBe(0.3);
    expect(toleranceForPositionSize(TIERS, 500)).toBe(0.2);
    expect(toleranceForPositionSize(TIERS, 999.99)).toBe(0.2);
    expect(toleranceForPositionSize(TIERS, 1000)).toBe(0.1);
    expect(toleranceForPositionSize(TIERS, 2_500_000)).toBe(0.1);
  });

  it("returns undefined for empty or catch-all-less tiers", () => {
    expect(toleranceForPositionSize(undefined, 50)).toBeUndefined();
    expect(toleranceForPositionSize([], 50)).toBeUndefined();
    expect(
      toleranceForPositionSize([{ upToUsd: 100, tolerancePercent: 0.5 }], 200)
    ).toBeUndefined();
  });
});

describe("getPriceDivergencePercent", () => {
  it("compares squared sqrt prices, not the sqrt prices themselves", () => {
    // sqrtPrice 2 -> price 4; sqrtPrice 3 -> price 9. 125%, not 50%.
    const divergence = getPriceDivergencePercent({
      fromPool: fromPool({ currentSqrtPrice: new Dec(2) }),
      toPool: toPool({ currentSqrtPrice: new Dec(3) }),
    });
    expect(divergence.toString()).toContain("125");
  });

  it("is zero for identical prices", () => {
    const divergence = getPriceDivergencePercent({
      fromPool: fromPool(),
      toPool: toPool(),
    });
    expect(divergence.isZero()).toBe(true);
  });
});

describe("deriveTokenMinAmount", () => {
  it("floors the simulated amount by the tolerance", () => {
    const min = deriveTokenMinAmount({
      simulatedAmount: new Int(1_000_000),
      minAmountTolerance: 1,
    });
    expect(min.toString()).toBe("990000");
  });

  it("never exceeds the simulated amount", () => {
    const simulatedAmount = new Int(1_000_000);
    const min = deriveTokenMinAmount({
      simulatedAmount,
      minAmountTolerance: 1,
    });
    expect(min.lte(simulatedAmount)).toBe(true);
  });

  // A zero minimum is the silent-success case: the create would succeed at
  // any price rather than reverting the batched withdraw with it.
  it("never returns zero for a positive deposit", () => {
    const min = deriveTokenMinAmount({
      simulatedAmount: new Int(1),
      minAmountTolerance: 1,
    });
    expect(min.toString()).toBe("1");
  });

  it("returns zero only for a zero deposit", () => {
    const min = deriveTokenMinAmount({
      simulatedAmount: new Int(0),
      minAmountTolerance: 1,
    });
    expect(min.toString()).toBe("0");
  });

  it("is looser for a larger tolerance", () => {
    const tight = deriveTokenMinAmount({
      simulatedAmount: new Int(1_000_000),
      minAmountTolerance: 0.1,
    });
    const loose = deriveTokenMinAmount({
      simulatedAmount: new Int(1_000_000),
      minAmountTolerance: 5,
    });
    expect(loose.lt(tight)).toBe(true);
  });
});

describe("isPositionUnlocked / findMigration", () => {
  it("is unlocked only when all three flags are clear", () => {
    expect(isPositionUnlocked(unlocked)).toBe(true);
    expect(isPositionUnlocked({ ...unlocked, isUnbonding: true })).toBe(false);
  });

  it("matches a source pool id as a string", () => {
    expect(
      findMigration({ migrations: [MIGRATION], fromPoolId: "1926" })
    ).toEqual(MIGRATION);
    expect(
      findMigration({ migrations: [MIGRATION], fromPoolId: "1927" })
    ).toBeUndefined();
  });

  it("returns undefined for an absent map", () => {
    expect(
      findMigration({ migrations: undefined, fromPoolId: "1926" })
    ).toBeUndefined();
  });
});

describe("poolStateFromChainResponse", () => {
  // Shaped like the live LCD response for pool 3504, including the
  // 36-decimal big-dec sqrt price the chain reports.
  const CHAIN_POOL: ChainConcentratedPoolResponse = {
    "@type": "/osmosis.concentratedliquidity.v1beta1.Pool",
    id: "3504",
    token0: "allBTC",
    token1: ALL_USDC,
    current_sqrt_price: "28.026618367609847378304796955893838320",
    tick_spacing: "100",
    spread_factor: "0.001000000000000000",
  };

  it("maps a concentrated pool, truncating the sqrt price to Dec precision", () => {
    const state = poolStateFromChainResponse(CHAIN_POOL);
    expect(state).toBeDefined();
    expect(state?.id).toBe("3504");
    expect(state?.type).toBe("concentrated");
    expect(state?.tickSpacing).toBe(100);
    expect(state?.spreadFactor).toBe("0.001000000000000000");
    // 36 fractional digits would throw in Dec's constructor; the mapper must
    // keep exactly the first 18.
    expect(state?.currentSqrtPrice.toString()).toBe("28.026618367609847378");
  });

  it("keeps an 18-or-fewer-decimal sqrt price verbatim", () => {
    expect(
      poolStateFromChainResponse({
        ...CHAIN_POOL,
        current_sqrt_price: "1.5",
      })?.currentSqrtPrice.toString()
    ).toBe("1.500000000000000000");
  });

  it("refuses any other pool type", () => {
    expect(
      poolStateFromChainResponse({
        ...CHAIN_POOL,
        "@type": "/osmosis.gamm.v1beta1.Pool",
      })
    ).toBeUndefined();
  });

  it("refuses a pool missing a needed field, and an absent pool", () => {
    expect(
      poolStateFromChainResponse({ ...CHAIN_POOL, spread_factor: undefined })
    ).toBeUndefined();
    expect(poolStateFromChainResponse(undefined)).toBeUndefined();
  });
});
