import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";

import {
  ceilCoinToDisplayDecimals,
  ChainConcentratedPoolResponse,
  ChainPositionResponse,
  DivergenceTier,
  findMigration,
  formatWalletDrawCap,
  getMigrationEligibility,
  getPriceDivergencePercent,
  getRangeMaxWithdrawAmounts,
  isMigrationRevalidationCurrent,
  isPositionUnlocked,
  MigrationPoolState,
  poolStateFromChainResponse,
  PositionMigration,
  positionStateFromChainResponse,
  rescalePositionValueUsd,
  toleranceForPositionSize,
  validatePositionMigrationsResponse,
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
  positionAmounts?: { amount0: string; amount1: string };
  positionTicks?: { lowerTick: string; upperTick: string };
}) =>
  getMigrationEligibility({
    migrations: args.migrations ?? [MIGRATION],
    priceDivergenceTiers: args.tiers ?? TIERS,
    positionValueUsd: args.positionValueUsd ?? 5000,
    positionAmounts: args.positionAmounts ?? {
      amount0: "1000000",
      amount1: "1000000",
    },
    positionTicks: args.positionTicks ?? {
      lowerTick: "-108000",
      upperTick: "342000",
    },
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

  // An out-of-range position pays out one asset only; the conversion and
  // create legs both assume positive amounts, so offering the button would
  // just fail after the sizing simulations with an opaque error.
  it.each([
    ["zero amount0", { amount0: "0", amount1: "1000000" }],
    ["zero amount1", { amount0: "1000000", amount1: "0" }],
    ["malformed amount", { amount0: "not-a-number", amount1: "1000000" }],
  ])("refuses a single-sided position (%s)", (_label, positionAmounts) => {
    expect(check({ positionAmounts })).toMatchObject({
      isEligible: false,
      reason: "singleSided",
    });
  });

  // A literal zero tick would need the create flow's shift-by-one-spacing
  // workaround, which would change the user's price range - the one promise
  // this migration makes - so it is refused instead.
  it.each([
    ["zero lower tick", { lowerTick: "0", upperTick: "342000" }],
    ["zero upper tick", { lowerTick: "-108000", upperTick: "0" }],
    ["malformed tick", { lowerTick: "abc", upperTick: "342000" }],
  ])("refuses a position with %s", (_label, positionTicks) => {
    expect(check({ positionTicks })).toMatchObject({
      isEligible: false,
      reason: "zeroTick",
    });
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

  // The pricing pipeline quietly values unpriceable assets at zero, so a
  // broken valuation must land in the STRICTEST tier, never the loosest.
  it("gates a zero, negative, or non-finite value at the catch-all tier", () => {
    expect(toleranceForPositionSize(TIERS, 0)).toBe(0.1);
    expect(toleranceForPositionSize(TIERS, -5)).toBe(0.1);
    expect(toleranceForPositionSize(TIERS, NaN)).toBe(0.1);
    // still refusing when there is no catch-all to fall back on
    expect(
      toleranceForPositionSize([{ upToUsd: 100, tolerancePercent: 0.5 }], 0)
    ).toBeUndefined();
  });
});

describe("validatePositionMigrationsResponse", () => {
  const VALID = {
    priceDivergenceTiers: TIERS,
    minAmountTolerance: 1,
    migrations: [MIGRATION],
  };

  it("passes the shape fe-content actually publishes", () => {
    expect(validatePositionMigrationsResponse(VALID)).toBe(VALID);
  });

  it("refuses undefined and non-objects", () => {
    expect(validatePositionMigrationsResponse(undefined)).toBeUndefined();
  });

  it.each([[0], [5.01], [100], [-1], [NaN]])(
    "refuses minAmountTolerance %p",
    (minAmountTolerance) => {
      expect(
        validatePositionMigrationsResponse({ ...VALID, minAmountTolerance })
      ).toBeUndefined();
    }
  );

  it("refuses a catch-all tier that is not last", () => {
    // The tier lookup walks in order: an early catch-all would gate every
    // position at the loosest tolerance.
    expect(
      validatePositionMigrationsResponse({
        ...VALID,
        priceDivergenceTiers: [
          { tolerancePercent: 0.5 },
          { upToUsd: 100, tolerancePercent: 0.1 },
        ],
      })
    ).toBeUndefined();
  });

  it("refuses unsorted tier bounds", () => {
    expect(
      validatePositionMigrationsResponse({
        ...VALID,
        priceDivergenceTiers: [
          { upToUsd: 500, tolerancePercent: 0.5 },
          { upToUsd: 100, tolerancePercent: 0.3 },
          { tolerancePercent: 0.1 },
        ],
      })
    ).toBeUndefined();
  });

  it("refuses tolerances that increase down the list", () => {
    expect(
      validatePositionMigrationsResponse({
        ...VALID,
        priceDivergenceTiers: [
          { upToUsd: 100, tolerancePercent: 0.1 },
          { tolerancePercent: 0.5 },
        ],
      })
    ).toBeUndefined();
  });

  it("refuses a divergence tolerance above the CMS safety ceiling", () => {
    expect(
      validatePositionMigrationsResponse({
        ...VALID,
        priceDivergenceTiers: [{ tolerancePercent: 5.01 }],
      })
    ).toBeUndefined();
  });

  it("refuses a missing catch-all and empty tiers", () => {
    expect(
      validatePositionMigrationsResponse({
        ...VALID,
        priceDivergenceTiers: [{ upToUsd: 100, tolerancePercent: 0.5 }],
      })
    ).toBeUndefined();
    expect(
      validatePositionMigrationsResponse({
        ...VALID,
        priceDivergenceTiers: [],
      })
    ).toBeUndefined();
  });

  it("refuses malformed migration entries", () => {
    expect(
      validatePositionMigrationsResponse({
        ...VALID,
        migrations: [{ ...MIGRATION, fromPoolId: "1926" as unknown as number }],
      })
    ).toBeUndefined();

    for (const migration of [
      { ...MIGRATION, fromPoolId: 0 },
      { ...MIGRATION, toPoolId: 3501.5 },
      { ...MIGRATION, tickSpacing: 0 },
      { ...MIGRATION, enabled: "false" },
      { ...MIGRATION, note: 123 },
    ]) {
      expect(
        validatePositionMigrationsResponse({
          ...VALID,
          migrations: [migration],
        })
      ).toBeUndefined();
    }
  });
});

describe("isMigrationRevalidationCurrent", () => {
  const eligible = {
    eligibility: {
      isEligible: true,
      migration: MIGRATION,
      divergencePercent: new Dec(0),
      appliedTolerancePercent: 0.1,
    } as const,
    minAmountTolerance: 1,
  };

  it("accepts the exact tolerance used to build the transaction", () => {
    expect(isMigrationRevalidationCurrent(eligible, 1)).toBe(true);
  });

  it("refuses either a tighter or looser live tolerance", () => {
    expect(isMigrationRevalidationCurrent(eligible, 0.5)).toBe(false);
    expect(isMigrationRevalidationCurrent(eligible, 2)).toBe(false);
  });

  it("refuses a missing or ineligible final check", () => {
    expect(isMigrationRevalidationCurrent(undefined, 1)).toBe(false);
    expect(
      isMigrationRevalidationCurrent(
        {
          eligibility: { isEligible: false, reason: "priceDivergence" },
          minAmountTolerance: 1,
        },
        1
      )
    ).toBe(false);
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

describe("getRangeMaxWithdrawAmounts", () => {
  // Ticks 0 and 9,000,000 span prices 1 to 10 exactly, so the edge maxima
  // have hand-computable values: max1 = L·(√10 − 1), max0 = L·(1 − 1/√10).
  it("returns the range-edge maxima, rounded up", () => {
    const amounts = getRangeMaxWithdrawAmounts({
      liquidity: "100",
      lowerTick: new Int(0),
      upperTick: new Int(9_000_000),
    });
    expect(amounts?.maxAmount0.toString()).toBe("69"); // ceil(68.377…)
    expect(amounts?.maxAmount1.toString()).toBe("217"); // ceil(216.227…)
    expect(amounts?.isInformative).toBe(true);
  });

  it("marks ultra-wide and full ranges as uninformative", () => {
    // A full-range position spans prices 1e-12 to 1e38; its edge maxima are
    // astronomical noise, so the UI must fall back to the bank-enforced
    // wallet-balance wording rather than display them.
    expect(
      getRangeMaxWithdrawAmounts({
        liquidity: "100",
        lowerTick: new Int(-108_000_000),
        upperTick: new Int(342_000_000),
      })?.isInformative
    ).toBe(false);
    // Exactly 100x between the bounds (sqrt ratio 10) is the last width that
    // still shows numbers…
    expect(
      getRangeMaxWithdrawAmounts({
        liquidity: "100",
        lowerTick: new Int(0),
        upperTick: new Int(18_000_000),
      })?.isInformative
    ).toBe(true);
    // …and anything wider does not.
    expect(
      getRangeMaxWithdrawAmounts({
        liquidity: "100",
        lowerTick: new Int(0),
        upperTick: new Int(18_000_100),
      })?.isInformative
    ).toBe(false);
  });

  it("handles negative ticks (prices below 1)", () => {
    // Ticks −9,000,000 and 0 span prices 0.1 to 1.
    const amounts = getRangeMaxWithdrawAmounts({
      liquidity: "1000",
      lowerTick: new Int(-9_000_000),
      upperTick: new Int(0),
    });
    expect(amounts?.maxAmount0.toString()).toBe("2163"); // ceil(2162.277…)
    expect(amounts?.maxAmount1.toString()).toBe("684"); // ceil(683.772…)
  });

  it("refuses malformed or degenerate positions", () => {
    const base = { lowerTick: new Int(0), upperTick: new Int(100) };
    expect(
      getRangeMaxWithdrawAmounts({ ...base, liquidity: "not-a-number" })
    ).toBeUndefined();
    expect(
      getRangeMaxWithdrawAmounts({ ...base, liquidity: "0" })
    ).toBeUndefined();
    expect(
      getRangeMaxWithdrawAmounts({
        liquidity: "100",
        lowerTick: new Int(100),
        upperTick: new Int(100),
      })
    ).toBeUndefined();
  });
});

describe("ceilCoinToDisplayDecimals", () => {
  const USDC_CURRENCY = {
    coinDenom: "USDC",
    coinMinimalDenom: "uusdc",
    coinDecimals: 6,
  };
  const coin = (baseAmount: string) =>
    new CoinPretty(USDC_CURRENCY, baseAmount);

  it("never lets a truncating display understate the cap", () => {
    // The review's boundary case: a 0.009999 USDC cap shown at two decimals
    // truncates to 0.0099 while the buffered transaction can spend 0.009949.
    // Ceiled first, the display becomes 0.01, which covers the spend.
    const ceiled = ceilCoinToDisplayDecimals(coin("9999"), 2);
    expect(ceiled.toCoin().amount).toBe("10000"); // 0.01 exactly
    // Truncating the ceiled value at the display precision drops nothing.
    expect(ceiled.maxDecimals(2).hideDenom(true).locale(false).toString()).toBe(
      "0.01"
    );
    // The rendered maximum stays at or above both the true cap...
    expect(new Int(ceiled.toCoin().amount).gte(new Int("9999"))).toBe(true);
    // ...and any spend the buffers allow under that cap.
    expect(new Int(ceiled.toCoin().amount).gte(new Int("9949"))).toBe(true);
  });

  it("keeps an amount already exact at the display precision", () => {
    expect(ceilCoinToDisplayDecimals(coin("10000"), 2).toCoin().amount).toBe(
      "10000"
    );
  });

  it("returns the coin unchanged when the display shows every decimal", () => {
    expect(ceilCoinToDisplayDecimals(coin("9999"), 6).toCoin().amount).toBe(
      "9999"
    );
    expect(ceilCoinToDisplayDecimals(coin("9999"), 8).toCoin().amount).toBe(
      "9999"
    );
  });

  it("returns a zero amount unchanged", () => {
    expect(ceilCoinToDisplayDecimals(coin("0"), 2).toCoin().amount).toBe("0");
  });

  // These assert the exact strings the modal renders, because the generic
  // formatter has TWO ways to understate: maxDecimals truncates, and shrink
  // sheds fractional digits as the integer part grows (1,234.56 -> 1,234).
  // The cap's formatter must be immune to both.
  describe("formatWalletDrawCap (the production formatting path)", () => {
    it("shrinks precision with magnitude, always rounding up", () => {
      // shrinkDecimals' rule (one decimal shed per integer digit past the
      // first), but ceiled where shrink truncates: 1,234.56 at a two-decimal
      // cap shows no decimals, and rounds UP to 1,235 where the shrink
      // formatter rendered 1,234 and understated by 0.56.
      expect(formatWalletDrawCap(coin("1234560000"), 2)).toBe("1,235 USDC");
      // 5,329.268734 at a six-decimal cap: three decimals, ceiled.
      expect(formatWalletDrawCap(coin("5329268734"), 6)).toBe("5,329.269 USDC");
      // Nine whole digits: integer only, still ceiled.
      expect(formatWalletDrawCap(coin("272389545146868"), 6)).toBe(
        "272,389,546 USDC"
      );
    });

    it("rounds a sub-precision cap up, never down", () => {
      expect(formatWalletDrawCap(coin("9999"), 2)).toBe("0.01 USDC");
    });

    it("only ever trims zeros, which drops nothing", () => {
      // Values below 1 keep the full display precision.
      expect(formatWalletDrawCap(coin("210000"), 6)).toBe("0.21 USDC");
      expect(formatWalletDrawCap(coin("50000000000"), 2)).toBe("50,000 USDC");
    });
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

  // A squared negative would masquerade as a valid price in the divergence
  // check, and a malformed one must read as "cannot check", not throw.
  it("refuses malformed, zero, and negative sqrt prices", () => {
    expect(
      poolStateFromChainResponse({
        ...CHAIN_POOL,
        current_sqrt_price: "not-a-price",
      })
    ).toBeUndefined();
    expect(
      poolStateFromChainResponse({ ...CHAIN_POOL, current_sqrt_price: "-1.5" })
    ).toBeUndefined();
    expect(
      poolStateFromChainResponse({
        ...CHAIN_POOL,
        current_sqrt_price: "0.000000000000000000",
      })
    ).toBeUndefined();
  });
});

describe("positionStateFromChainResponse", () => {
  // Shaped like the live LCD response for position 15507161 in pool 3513.
  const CHAIN_POSITION: ChainPositionResponse = {
    position: {
      position: {
        pool_id: "3513",
        lower_tick: "-15780400",
        upper_tick: "-15269100",
      },
      asset0: { amount: "521075573", denom: "uosmo" },
      asset1: { amount: "8614810", denom: ALL_USDC },
    },
  };

  it("maps the amounts and ticks the eligibility checks take", () => {
    expect(positionStateFromChainResponse(CHAIN_POSITION, "3513")).toEqual({
      positionAmounts: { amount0: "521075573", amount1: "8614810" },
      positionTicks: { lowerTick: "-15780400", upperTick: "-15269100" },
    });
  });

  // A response for a different position must never authorize this one.
  it("refuses a response from another pool", () => {
    expect(
      positionStateFromChainResponse(CHAIN_POSITION, "1464")
    ).toBeUndefined();
  });

  it("keeps a zero side, which the single-sided check then refuses", () => {
    const outOfRange = {
      position: {
        ...CHAIN_POSITION.position,
        asset0: { amount: "0", denom: "uosmo" },
      },
    };
    expect(
      positionStateFromChainResponse(outOfRange, "3513")?.positionAmounts
    ).toEqual({ amount0: "0", amount1: "8614810" });
  });

  it("refuses an absent, empty, or incomplete response", () => {
    expect(positionStateFromChainResponse(undefined, "3513")).toBeUndefined();
    expect(positionStateFromChainResponse({}, "3513")).toBeUndefined();
    expect(
      positionStateFromChainResponse(
        {
          position: {
            ...CHAIN_POSITION.position,
            asset1: { denom: ALL_USDC },
          },
        },
        "3513"
      )
    ).toBeUndefined();
  });
});

describe("rescalePositionValueUsd", () => {
  const rendered = { amount0: "1000000", amount1: "1000000" };

  it("leaves an unchanged position at its rendered value", () => {
    expect(
      rescalePositionValueUsd({
        positionValueUsd: 500,
        renderedAmounts: rendered,
        freshAmounts: rendered,
      })
    ).toBe(500);
  });

  // Tier selection must follow the amounts actually read, so a position that
  // grew past a boundary gates at the tighter tolerance.
  it("scales up when a side grew", () => {
    expect(
      rescalePositionValueUsd({
        positionValueUsd: 500,
        renderedAmounts: rendered,
        freshAmounts: { amount0: "1000000", amount1: "3000000" },
      })
    ).toBe(1500);
  });

  // Taking the larger per-side ratio keeps the estimate high, which selects
  // the tighter tier when the split between sides is unknown.
  it("takes the larger side ratio when the sides diverge", () => {
    expect(
      rescalePositionValueUsd({
        positionValueUsd: 100,
        renderedAmounts: rendered,
        freshAmounts: { amount0: "500000", amount1: "2000000" },
      })
    ).toBe(200);
  });

  // 0 is the strictest tier in toleranceForPositionSize, so every unusable
  // input refuses to loosen the gate.
  it.each([
    ["zero value", 0, rendered],
    ["negative value", -10, rendered],
    ["non-finite value", NaN, rendered],
  ])("returns 0 for %s", (_label, positionValueUsd, freshAmounts) => {
    expect(
      rescalePositionValueUsd({
        positionValueUsd,
        renderedAmounts: rendered,
        freshAmounts,
      })
    ).toBe(0);
  });

  it("returns 0 for malformed or zeroed rendered amounts", () => {
    expect(
      rescalePositionValueUsd({
        positionValueUsd: 500,
        renderedAmounts: { amount0: "bad", amount1: "1000000" },
        freshAmounts: rendered,
      })
    ).toBe(0);
    expect(
      rescalePositionValueUsd({
        positionValueUsd: 500,
        renderedAmounts: { amount0: "0", amount1: "0" },
        freshAmounts: rendered,
      })
    ).toBe(0);
  });

  it("returns 0 when the position emptied out", () => {
    expect(
      rescalePositionValueUsd({
        positionValueUsd: 500,
        renderedAmounts: rendered,
        freshAmounts: { amount0: "0", amount1: "0" },
      })
    ).toBe(0);
  });
});
