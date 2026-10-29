import type {
  AssetVariant,
  ForcedMigrationHolding,
} from "@osmosis-labs/server";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";

import {
  ForcedMigration,
  getActiveForcedMigrations,
  getPositionExitTolerancePercent,
  getShareExitTokenOutMins,
  HeldAssetAmount,
  isForcedMigrationSnoozed,
  isWithdrawWithinTolerance,
  parseForcedMigrations,
} from "../forced-migrations";

const USDC_NOBLE =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
const ALL_USDC =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";
// Hypothetical 8-decimal asset and its alloy.
const OLD_8DP = "factory/osmo1old/old8dp";
const ALL_8DP = "factory/osmo1alloy/alloyed/all8dp";

const USD = {
  currency: "usd",
  symbol: "$",
  maxDecimals: 2,
  locale: "en-US",
};

const NOW = new Date("2026-11-01T00:00:00Z");

const makeMigration = (
  overrides?: Partial<ForcedMigration>
): ForcedMigration => ({
  id: "usdc-noble",
  fromDenoms: [USDC_NOBLE],
  toDenom: ALL_USDC,
  action: "convert",
  startDate: "2026-10-01T00:00:00Z",
  deadline: "2027-01-13T00:00:00Z",
  escalateDate: "2026-12-20T00:00:00Z",
  enTitleOrLocalizationPath: "title",
  enBodyOrLocalizationPath: "body",
  ...overrides,
});

const makeVariant = (
  denom: string,
  decimals: number,
  minimalAmount: string,
  canonicalDenom: string
): AssetVariant =>
  ({
    name: denom,
    amount: new CoinPretty(
      { coinDenom: denom, coinMinimalDenom: denom, coinDecimals: decimals },
      minimalAmount
    ),
    fiatValue: new PricePretty(USD, new Dec(1)),
    canonicalAsset: { coinMinimalDenom: canonicalDenom },
  }) as AssetVariant;

const held = (
  denom: string,
  amount: string,
  fiatValue = "100"
): HeldAssetAmount => ({ denom, coinDenom: denom, amount, fiatValue });

describe("getActiveForcedMigrations", () => {
  it("offers the bank balance for convert and reports nothing elsewhere when it is all in the bank", () => {
    const [active] = getActiveForcedMigrations({
      migrations: [makeMigration()],
      heldAssets: [held(USDC_NOBLE, "5000000")],
      assetVariants: [makeVariant(USDC_NOBLE, 6, "5000000", ALL_USDC)],
      now: NOW,
    });

    expect(active.convertibleVariants).toHaveLength(1);
    expect(active.heldElsewhere).toEqual([]);
  });

  it("reports the non-bank remainder in minimal units, at 8 decimals", () => {
    // 0.5 in total, 0.2 of it in the bank: 0.3 is pooled or locked.
    const [active] = getActiveForcedMigrations({
      migrations: [
        makeMigration({
          id: "old-8dp",
          fromDenoms: [OLD_8DP],
          toDenom: ALL_8DP,
        }),
      ],
      heldAssets: [held(OLD_8DP, "50000000")],
      assetVariants: [makeVariant(OLD_8DP, 8, "20000000", ALL_8DP)],
      now: NOW,
    });

    expect(active.convertibleVariants).toHaveLength(1);
    expect(active.heldElsewhere).toEqual([held(OLD_8DP, "30000000")]);
  });

  it("does not offer a convert whose canonical asset is not the configured target", () => {
    const [active] = getActiveForcedMigrations({
      migrations: [makeMigration()],
      heldAssets: [held(USDC_NOBLE, "5000000")],
      assetVariants: [makeVariant(USDC_NOBLE, 6, "5000000", "uusdc-other")],
      now: NOW,
    });

    expect(active.convertibleVariants).toEqual([]);
    expect(active.heldElsewhere).toEqual([held(USDC_NOBLE, "5000000")]);
  });

  it("matches on the full denom only", () => {
    expect(
      getActiveForcedMigrations({
        migrations: [makeMigration()],
        heldAssets: [held(USDC_NOBLE.toLowerCase(), "5000000")],
        assetVariants: [],
        now: NOW,
      })
    ).toEqual([]);
  });

  it("skips holdings below minFiatValueUsd, but never unpriced ones", () => {
    const migration = makeMigration({ minFiatValueUsd: 1 });

    expect(
      getActiveForcedMigrations({
        migrations: [migration],
        heldAssets: [held(USDC_NOBLE, "500000", "0.5")],
        assetVariants: [makeVariant(USDC_NOBLE, 6, "500000", ALL_USDC)],
        now: NOW,
      })
    ).toEqual([]);

    expect(
      getActiveForcedMigrations({
        migrations: [migration],
        heldAssets: [held(USDC_NOBLE, "500000", "0")],
        assetVariants: [makeVariant(USDC_NOBLE, 6, "500000", ALL_USDC)],
        now: NOW,
      })
    ).toHaveLength(1);
  });

  it("ignores migrations that have not started", () => {
    expect(
      getActiveForcedMigrations({
        migrations: [makeMigration({ startDate: "2026-12-01T00:00:00Z" })],
        heldAssets: [held(USDC_NOBLE, "5000000")],
        assetVariants: [makeVariant(USDC_NOBLE, 6, "5000000", ALL_USDC)],
        now: NOW,
      })
    ).toEqual([]);
  });

  it("sorts by deadline, with no deadline last", () => {
    const active = getActiveForcedMigrations({
      migrations: [
        makeMigration({
          id: "old-8dp",
          fromDenoms: [OLD_8DP],
          toDenom: ALL_8DP,
          deadline: undefined,
          escalateDate: undefined,
        }),
        makeMigration(),
      ],
      heldAssets: [held(OLD_8DP, "1"), held(USDC_NOBLE, "5000000")],
      assetVariants: [],
      now: NOW,
    });

    expect(active.map(({ migration }) => migration.id)).toEqual([
      "usdc-noble",
      "old-8dp",
    ]);
  });
});

describe("parseForcedMigrations", () => {
  beforeEach(() => jest.spyOn(console, "warn").mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it("keeps a valid entry, with or without a deadline", () => {
    const withoutDeadline = makeMigration({
      deadline: undefined,
      escalateDate: undefined,
    });
    expect(parseForcedMigrations([makeMigration(), withoutDeadline])).toEqual([
      makeMigration(),
      withoutDeadline,
    ]);
  });

  it.each([
    ["no fromDenoms", { fromDenoms: [] }],
    ["toDenom among fromDenoms", { toDenom: USDC_NOBLE }],
    ["unsupported action", { action: "swap" }],
    ["unparseable deadline", { deadline: "soon" }],
    ["negative minFiatValueUsd", { minFiatValueUsd: -1 }],
  ])("skips an entry with %s", (_, overrides) => {
    expect(
      parseForcedMigrations([makeMigration(overrides as any), makeMigration()])
    ).toEqual([makeMigration()]);
  });
});

describe("isForcedMigrationSnoozed", () => {
  const snoozedAt = NOW.getTime();
  const twoHoursLater = new Date(snoozedAt + 2 * 60 * 60 * 1000);

  it("holds a snooze for 24h before escalation and 1h after", () => {
    expect(isForcedMigrationSnoozed(snoozedAt, "notice", twoHoursLater)).toBe(
      true
    );
    expect(
      isForcedMigrationSnoozed(snoozedAt, "escalated", twoHoursLater)
    ).toBe(false);
  });

  it("treats a missing or corrupt snooze as not snoozed", () => {
    expect(isForcedMigrationSnoozed(undefined, "notice", NOW)).toBe(false);
    expect(isForcedMigrationSnoozed(NaN, "notice", NOW)).toBe(false);
  });
});

describe("getActiveForcedMigrations with per-position holdings", () => {
  const share = (
    state: "available" | "locked" | "unlocking",
    oldAmount: string
  ): ForcedMigrationHolding => ({
    kind: "share",
    poolId: "1",
    state,
    shares: "1000",
    locks: state === "available" ? [] : [{ lockId: "7", isSynthetic: false }],
    coins: [
      { denom: USDC_NOBLE, amount: oldAmount },
      { denom: "uosmo", amount: "1000000" },
    ],
    oldDenomAmount: oldAmount,
  });

  it("doesn't raise the popup for positions that are already unlocking", () => {
    expect(
      getActiveForcedMigrations({
        migrations: [makeMigration()],
        heldAssets: [held(USDC_NOBLE, "5000000", "5")],
        assetVariants: [],
        holdings: [share("unlocking", "5000000")],
        now: NOW,
      })
    ).toEqual([]);
  });

  it("lists locked positions and keeps unlocking ones out of the dust threshold", () => {
    const [active] = getActiveForcedMigrations({
      migrations: [makeMigration({ minFiatValueUsd: 3 })],
      // 9 USDC.noble priced at $9 across the portfolio: $1 per USDC.
      heldAssets: [held(USDC_NOBLE, "9000000", "9")],
      assetVariants: [],
      holdings: [share("locked", "4000000"), share("unlocking", "5000000")],
      now: NOW,
    });
    expect(active.positions).toHaveLength(1);
    expect(active.unlocking).toHaveLength(1);
    expect(active.heldElsewhere).toEqual([]);

    // Only the locked $4 counts; under a $5 threshold nothing shows.
    expect(
      getActiveForcedMigrations({
        migrations: [makeMigration({ minFiatValueUsd: 5 })],
        heldAssets: [held(USDC_NOBLE, "9000000", "9")],
        assetVariants: [],
        holdings: [share("locked", "4000000"), share("unlocking", "5000000")],
        now: NOW,
      })
    ).toEqual([]);
  });

  it("doesn't throw on a persisted portfolio that predates amount and fiat value", () => {
    const legacy = { denom: USDC_NOBLE, coinDenom: "USDC.noble" };
    expect(() =>
      getActiveForcedMigrations({
        migrations: [makeMigration()],
        heldAssets: [legacy as unknown as HeldAssetAmount],
        assetVariants: [],
        holdings: [],
        now: NOW,
      })
    ).not.toThrow();
  });

  it("names a held balance that is neither convertible nor in a position", () => {
    const [active] = getActiveForcedMigrations({
      migrations: [makeMigration()],
      heldAssets: [held(USDC_NOBLE, "2000000", "2")],
      // No variant (e.g. its alloy is unavailable) and no position rows.
      assetVariants: [],
      holdings: [],
      now: NOW,
    });
    expect(active.convertibleVariants).toEqual([]);
    expect(active.heldElsewhere).toEqual([]);
    expect(active.unconvertible.map(({ denom }) => denom)).toEqual([
      USDC_NOBLE,
    ]);
  });

  it("matches limit orders by exact denom", () => {
    const order: ForcedMigrationHolding = {
      kind: "order",
      orderbookAddress: "osmo1book",
      orderId: 1,
      tickId: 2,
      direction: "bid",
      baseDenom: "uosmo",
      quoteDenom: USDC_NOBLE,
      percentFilled: "0",
      percentClaimed: "0",
      inDenom: USDC_NOBLE,
      outDenom: "uosmo",
      remaining: "2000000",
      unclaimed: "0",
      oldDenomAmount: "2000000",
    };
    const [active] = getActiveForcedMigrations({
      migrations: [makeMigration()],
      heldAssets: [held(USDC_NOBLE, "2000000", "2")],
      assetVariants: [],
      holdings: [order, { ...order, inDenom: "ibc/OTHER", orderId: 3 }],
      now: NOW,
    });
    expect(active.positions).toEqual([order]);
  });
});

describe("getPositionExitTolerancePercent", () => {
  it("defaults to 5% and accepts values up to the 10% cap", () => {
    expect(getPositionExitTolerancePercent({})).toBe(5);
    expect(
      getPositionExitTolerancePercent({
        positionExit: { maxSlippagePercent: 8 },
      })
    ).toBe(8);
  });

  it.each([0, -1, 10.5, NaN])("rejects %s rather than clamping it", (value) => {
    expect(
      getPositionExitTolerancePercent({
        positionExit: { maxSlippagePercent: value },
      })
    ).toBeUndefined();
  });
});

describe("getShareExitTokenOutMins", () => {
  it("floors each coin at the tolerance and drops coins that round to zero", () => {
    expect(
      getShareExitTokenOutMins({
        expectedCoins: [
          { denom: USDC_NOBLE, amount: "1000001" },
          { denom: "uosmo", amount: "1" },
        ],
        tolerancePercent: 5,
        oldDenoms: [USDC_NOBLE],
      })
    ).toEqual([{ denom: USDC_NOBLE, amount: "950000" }]);
  });

  it("refuses to build an exit that doesn't bound the old denom", () => {
    expect(() =>
      getShareExitTokenOutMins({
        expectedCoins: [{ denom: USDC_NOBLE, amount: "1" }],
        tolerancePercent: 5,
        oldDenoms: [USDC_NOBLE],
      })
    ).toThrow();
    expect(() =>
      getShareExitTokenOutMins({
        expectedCoins: [{ denom: USDC_NOBLE, amount: "1000000" }],
        tolerancePercent: 0,
        oldDenoms: [USDC_NOBLE],
      })
    ).toThrow();
  });
});

describe("isWithdrawWithinTolerance", () => {
  const preview = [
    { denom: USDC_NOBLE, amount: "1000000" },
    { denom: "uosmo", amount: "2000000" },
  ];

  it("passes while each side holds within the tolerance", () => {
    expect(
      isWithdrawWithinTolerance({
        previewCoins: preview,
        freshCoins: [
          { denom: USDC_NOBLE, amount: "950000" },
          { denom: "uosmo", amount: "2100000" },
        ],
        tolerancePercent: 5,
      })
    ).toBe(true);
  });

  it("fails when one side falls further, or a side is missing", () => {
    expect(
      isWithdrawWithinTolerance({
        previewCoins: preview,
        freshCoins: [
          { denom: USDC_NOBLE, amount: "949999" },
          { denom: "uosmo", amount: "3000000" },
        ],
        tolerancePercent: 5,
      })
    ).toBe(false);
    expect(
      isWithdrawWithinTolerance({
        previewCoins: preview,
        freshCoins: [{ denom: USDC_NOBLE, amount: "1000000" }],
        tolerancePercent: 5,
      })
    ).toBe(false);
  });
});
