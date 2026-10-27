import type { AssetVariant } from "@osmosis-labs/server";
import { Dec, Int } from "@osmosis-labs/unit";

import type { CMSBannerFields } from "~/utils/asset-alerts";

/**
 * Forced migrations are time-critical asset wind-downs (e.g. a bridge or
 * issuer going away) where holding the old asset past a point loses funds.
 * Unlike the alloyed-assets toast, the popup they drive cannot be permanently
 * dismissed: it returns after a snooze until the wallet no longer holds the
 * asset. Sourced from the osmosis-labs/fe-content repo.
 * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/forced-migrations.json
 */
export interface ForcedMigration {
  /** Unique, stable id. Snoozes are stored under it. */
  id: string;
  /** Minimal denoms being wound down, e.g. `ibc/HASH`. Never symbols. */
  fromDenoms: string[];
  /** Minimal denom the old assets convert into. Must be the canonical asset
   *  (variant group key) of every `fromDenoms` entry. */
  toDenom: string;
  /** Only `convert` (variant to its canonical asset) is supported. */
  action: "convert";
  startDate: string;
  /** From here the snooze shortens and the popup reads as a warning. */
  escalateDate?: string;
  /** Shown as a date only when set; leave unset if no date is public. */
  deadline?: string;
  /** Holdings worth less than this in total don't raise the popup. Holdings
   *  that can't be priced always do. */
  minFiatValueUsd?: number;
  enTitleOrLocalizationPath: string;
  /** May contain `{symbols}` and `{deadline}` placeholders. */
  enBodyOrLocalizationPath: string;
  /** Replaces the body once `deadline` has passed. */
  enAfterDeadlineBodyOrLocalizationPath?: string;
  link?: CMSBannerFields["link"];
  localization?: Record<string, Record<string, any>>;
}

export interface ForcedMigrationsResponse {
  migrations: unknown[];
}

/** Same shape as `HeldAsset` from the portfolio query in `@osmosis-labs/server`. */
export interface HeldAssetAmount {
  denom: string;
  coinDenom?: string;
  /** Total across every category, in minimal units. */
  amount: string;
  fiatValue: string;
}

export type ForcedMigrationStage = "notice" | "escalated" | "pastDeadline";

export interface ActiveForcedMigration {
  migration: ForcedMigration;
  stage: ForcedMigrationStage;
  /** Bank balances that can be converted to `toDenom` from the popup. */
  convertibleVariants: AssetVariant[];
  /** Old assets held outside the bank balance (pooled, staked, in locks,
   *  rewards), or in the bank but without a valid convert route. The user has
   *  to free these first. */
  heldElsewhere: HeldAssetAmount[];
}

const SNOOZE_MS: Record<ForcedMigrationStage, number> = {
  notice: 24 * 60 * 60 * 1000,
  escalated: 60 * 60 * 1000,
  pastDeadline: 60 * 60 * 1000,
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const isValidDate = (value: unknown): value is string =>
  isNonEmptyString(value) && !Number.isNaN(new Date(value).getTime());

/**
 * Keeps only well-formed entries. A malformed entry is skipped and logged,
 * never patched up: a popup built on a guessed denom or date is worse than no
 * popup.
 */
export function parseForcedMigrations(
  raw: unknown[] | undefined
): ForcedMigration[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter((entry): entry is ForcedMigration => {
    const problem = getForcedMigrationProblem(entry);
    if (problem) {
      console.warn("Skipping malformed forced migration:", problem, entry);
      return false;
    }
    return true;
  });
}

function getForcedMigrationProblem(entry: any): string | undefined {
  if (!entry || typeof entry !== "object") return "not an object";
  if (!isNonEmptyString(entry.id)) return "missing id";
  if (
    !Array.isArray(entry.fromDenoms) ||
    entry.fromDenoms.length === 0 ||
    !entry.fromDenoms.every(isNonEmptyString)
  )
    return "missing fromDenoms";
  if (!isNonEmptyString(entry.toDenom)) return "missing toDenom";
  if (entry.fromDenoms.includes(entry.toDenom))
    return "toDenom is also a fromDenom";
  if (entry.action !== "convert") return "unsupported action";
  if (!isValidDate(entry.startDate)) return "invalid startDate";
  if (entry.escalateDate !== undefined && !isValidDate(entry.escalateDate))
    return "invalid escalateDate";
  if (entry.deadline !== undefined && !isValidDate(entry.deadline))
    return "invalid deadline";
  if (
    entry.minFiatValueUsd !== undefined &&
    (typeof entry.minFiatValueUsd !== "number" || entry.minFiatValueUsd < 0)
  )
    return "invalid minFiatValueUsd";
  if (!isNonEmptyString(entry.enTitleOrLocalizationPath))
    return "missing title";
  if (!isNonEmptyString(entry.enBodyOrLocalizationPath)) return "missing body";
  return undefined;
}

export function getForcedMigrationStage(
  migration: ForcedMigration,
  now: Date
): ForcedMigrationStage {
  if (migration.deadline && now >= new Date(migration.deadline))
    return "pastDeadline";
  if (migration.escalateDate && now >= new Date(migration.escalateDate))
    return "escalated";
  return "notice";
}

/** Snooze key, per migration and wallet so one wallet's snooze doesn't hide
 *  the popup for another. */
export const getForcedMigrationSnoozeKey = (id: string, address: string) =>
  `forced-migration-snooze:${id}:${address}`;

/**
 * Whether a snooze taken at `snoozedAtMs` still holds. The length depends on
 * the stage now, not at snooze time, so crossing `escalateDate` shortens an
 * open 24h snooze to 1h.
 */
export function isForcedMigrationSnoozed(
  snoozedAtMs: number | undefined,
  stage: ForcedMigrationStage,
  now: Date
): boolean {
  if (snoozedAtMs === undefined || Number.isNaN(snoozedAtMs)) return false;
  return now.getTime() < snoozedAtMs + SNOOZE_MS[stage];
}

/** When a snooze taken at `snoozedAtMs` runs out, for re-render scheduling. */
export function getForcedMigrationSnoozeEndMs(
  snoozedAtMs: number,
  stage: ForcedMigrationStage
): number {
  return snoozedAtMs + SNOOZE_MS[stage];
}

/**
 * Matches started migrations against what the wallet holds, by exact minimal
 * denom. Snoozing and the feature flag are left to the caller.
 *
 * `heldAssets` are totals across every category, so the amount held outside
 * the bank is the total less the bank balance.
 */
export function getActiveForcedMigrations({
  migrations,
  heldAssets,
  assetVariants,
  now = new Date(),
}: {
  migrations: ForcedMigration[];
  heldAssets: HeldAssetAmount[];
  assetVariants: AssetVariant[];
  now?: Date;
}): ActiveForcedMigration[] {
  if (heldAssets.length === 0) return [];

  const heldByDenom = new Map(heldAssets.map((asset) => [asset.denom, asset]));
  const variantByDenom = new Map(
    assetVariants.map((variant) => [
      variant.amount.currency.coinMinimalDenom,
      variant,
    ])
  );

  return migrations
    .filter((migration) => now >= new Date(migration.startDate))
    .map((migration): ActiveForcedMigration | undefined => {
      const convertibleVariants: AssetVariant[] = [];
      const heldElsewhere: HeldAssetAmount[] = [];
      let totalFiat = new Dec(0);
      let hasUnpricedHolding = false;

      for (const denom of migration.fromDenoms) {
        const held = heldByDenom.get(denom);
        if (!held) continue;

        const heldAmount = new Int(held.amount);
        if (!heldAmount.isPositive()) continue;

        const heldFiat = new Dec(held.fiatValue);
        totalFiat = totalFiat.add(heldFiat);
        // Sidecar values a coin it can't price at zero, which is unknown, not
        // worthless.
        if (heldFiat.isZero()) hasUnpricedHolding = true;

        const variant = variantByDenom.get(denom);
        // The convert swaps into the variant's canonical asset, so only offer
        // it when that is the configured target.
        const canConvert =
          variant?.canonicalAsset?.coinMinimalDenom === migration.toDenom;
        if (variant && !canConvert) {
          console.warn(
            `Forced migration ${migration.id}: ${denom} converts to ${variant.canonicalAsset?.coinMinimalDenom}, not ${migration.toDenom}`
          );
        }

        let bankAmount = new Int(0);
        if (variant && canConvert) {
          bankAmount = new Int(variant.amount.toCoin().amount);
          if (bankAmount.isPositive()) convertibleVariants.push(variant);
        }

        const elsewhereAmount = heldAmount.sub(bankAmount);
        if (elsewhereAmount.isPositive()) {
          heldElsewhere.push({ ...held, amount: elsewhereAmount.toString() });
        }
      }

      if (convertibleVariants.length === 0 && heldElsewhere.length === 0)
        return undefined;

      const minFiat = migration.minFiatValueUsd;
      if (
        minFiat !== undefined &&
        !hasUnpricedHolding &&
        totalFiat.lt(new Dec(minFiat))
      )
        return undefined;

      return {
        migration,
        stage: getForcedMigrationStage(migration, now),
        convertibleVariants,
        heldElsewhere,
      };
    })
    .filter((active): active is ActiveForcedMigration => Boolean(active))
    .sort(
      (a, b) => deadlineSortValue(a.migration) - deadlineSortValue(b.migration)
    );
}

/** Soonest deadline first; no deadline sorts last. */
const deadlineSortValue = ({ deadline }: ForcedMigration) =>
  deadline ? new Date(deadline).getTime() : Number.POSITIVE_INFINITY;
