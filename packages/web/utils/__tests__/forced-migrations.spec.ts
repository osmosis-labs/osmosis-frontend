import type { AssetVariant } from "@osmosis-labs/server";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";

import {
  ForcedMigration,
  getActiveForcedMigrations,
  HeldAssetAmount,
  isForcedMigrationSnoozed,
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
