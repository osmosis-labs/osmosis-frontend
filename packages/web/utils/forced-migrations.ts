import type {
  AssetVariant,
  ForcedMigrationHolding,
} from "@osmosis-labs/server";
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
  /** Shown beside a lock whose unlock would end after `deadline`: what
   *  happens to the asset then. May contain `{deadline}`. */
  enLateUnlockNoteOrLocalizationPath?: string;
  link?: CMSBannerFields["link"];
  /** How far a position exit may fall short of its preview, and how wide a
   *  mapped pool migration's price gap may be. Loose on purpose: losing a few
   *  percent beats holding the old asset past the deadline. */
  positionExit?: { maxSlippagePercent?: number };
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
  /** Pool positions, locks and limit orders holding an old asset that the
   *  user can act on now (withdraw, migrate, unlock, cancel or claim). */
  positions: ForcedMigrationHolding[];
  /** Positions already unlocking. Shown, but they don't raise the popup:
   *  they become `positions` once the unlock ends. */
  unlocking: ForcedMigrationHolding[];
  /** Only when per-position holdings couldn't be loaded: old assets outside
   *  the bank balance by the portfolio totals, which can't tell locked from
   *  unlocking. */
  heldElsewhere: HeldAssetAmount[];
  /** Held old assets that can't be converted from the bank and aren't in any
   *  position row (e.g. the variant is missing or its alloy is unavailable),
   *  so the popup can name them instead of going silent. */
  unconvertible: HeldAssetAmount[];
}

/** Default and cap for `positionExit.maxSlippagePercent`. */
export const DEFAULT_POSITION_EXIT_TOLERANCE_PERCENT = 5;
export const MAX_POSITION_EXIT_TOLERANCE_PERCENT = 10;

const isValidTolerance = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value > 0 &&
  value <= MAX_POSITION_EXIT_TOLERANCE_PERCENT;

/**
 * The position exit tolerance for a migration, in percent: the CMS value, or
 * the default when unset. Undefined when the CMS value is out of range, which
 * hides the exit actions rather than clamping a value someone mistyped.
 */
export function getPositionExitTolerancePercent(
  migration: Pick<ForcedMigration, "positionExit">
): number | undefined {
  const { positionExit } = migration;
  if (positionExit === undefined)
    return DEFAULT_POSITION_EXIT_TOLERANCE_PERCENT;
  if (!positionExit || typeof positionExit !== "object") return undefined;
  const value = positionExit.maxSlippagePercent;
  if (value === undefined) return DEFAULT_POSITION_EXIT_TOLERANCE_PERCENT;
  return isValidTolerance(value) ? value : undefined;
}

/**
 * `tokenOutMins` for exiting a classic pool: each expected coin less the
 * tolerance, rounded down. A coin whose minimum rounds to zero is worth less
 * than a base unit and is left out (the chain rejects zero coins), but the
 * list always bounds an old denom, so an exit is never sent unprotected.
 */
export function getShareExitTokenOutMins({
  expectedCoins,
  tolerancePercent,
  oldDenoms,
}: {
  expectedCoins: { denom: string; amount: string }[];
  tolerancePercent: number;
  oldDenoms: string[];
}): { denom: string; amount: string }[] {
  if (!isValidTolerance(tolerancePercent))
    throw new Error(`Invalid exit tolerance: ${tolerancePercent}`);
  const keep = new Dec(1).sub(new Dec(tolerancePercent).quo(new Dec(100)));

  const mins = expectedCoins
    .map(({ denom, amount }) => ({
      denom,
      amount: new Dec(amount).mul(keep).truncate(),
    }))
    .filter(({ amount }) => amount.isPositive())
    .map(({ denom, amount }) => ({ denom, amount: amount.toString() }))
    // `MsgExitPool` rejects minimums that aren't sorted by denom.
    .sort((a, b) => (a.denom < b.denom ? -1 : a.denom > b.denom ? 1 : 0));

  if (!mins.some(({ denom }) => oldDenoms.includes(denom)))
    throw new Error("Exit minimums don't bound the old denom");
  return mins;
}

/**
 * Whether a CL position read just before signing still pays out within the
 * tolerance of its preview, side by side: a price move shifts value from one
 * side to the other, and the loss shows as one side falling. A CL withdrawal
 * has no minimum on chain, so this check (before the wallet prompt and again
 * after signing) is its bound.
 */
export function isWithdrawWithinTolerance({
  previewCoins,
  freshCoins,
  tolerancePercent,
}: {
  previewCoins: { denom: string; amount: string }[];
  freshCoins: { denom: string; amount: string }[];
  tolerancePercent: number;
}): boolean {
  if (!isValidTolerance(tolerancePercent)) return false;
  const keep = new Dec(1).sub(new Dec(tolerancePercent).quo(new Dec(100)));
  return previewCoins.every(({ denom, amount }) => {
    const min = new Dec(amount).mul(keep).truncate();
    const fresh = freshCoins.find((coin) => coin.denom === denom);
    return new Int(fresh?.amount ?? "0").gte(min);
  });
}

/** Denoms a holding touches, for matching it to a migration. */
const getHoldingDenoms = (holding: ForcedMigrationHolding): string[] =>
  holding.kind === "order"
    ? [holding.inDenom, holding.outDenom]
    : holding.coins.map(({ denom }) => denom);

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
    (typeof entry.minFiatValueUsd !== "number" ||
      !Number.isFinite(entry.minFiatValueUsd) ||
      entry.minFiatValueUsd < 0)
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
 * With `holdings` (per-position rows from chain state), positions that are
 * already unlocking don't raise the popup or count towards the dust
 * threshold. Without them (the query failed), the amount outside the bank
 * falls back to the portfolio total less the bank balance, which nags about
 * everything rather than going silent.
 */
export function getActiveForcedMigrations({
  migrations,
  heldAssets,
  assetVariants,
  holdings,
  now = new Date(),
}: {
  migrations: ForcedMigration[];
  heldAssets: HeldAssetAmount[];
  assetVariants: AssetVariant[];
  holdings?: ForcedMigrationHolding[];
  now?: Date;
}): ActiveForcedMigration[] {
  if (heldAssets.length === 0 && !holdings?.length) return [];

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
      const unconvertible: HeldAssetAmount[] = [];
      let totalFiat = new Dec(0);
      let hasUnpricedHolding = false;

      /** Adds `amount` of `denom` at the portfolio's unit price. Sidecar
       *  values a coin it can't price at zero, which is unknown, not
       *  worthless. */
      const addValue = (denom: string, amount: Int) => {
        const held = heldByDenom.get(denom);
        const heldAmount = new Int(held?.amount ?? "0");
        const heldFiat = new Dec(held?.fiatValue ?? "0");
        if (!heldAmount.isPositive() || heldFiat.isZero()) {
          hasUnpricedHolding = true;
          return;
        }
        totalFiat = totalFiat.add(
          heldFiat.mul(new Dec(amount)).quo(new Dec(heldAmount))
        );
      };

      const migrationHoldings = (holdings ?? []).filter((holding) =>
        getHoldingDenoms(holding).some((denom) =>
          migration.fromDenoms.includes(denom)
        )
      );
      const isUnlocking = (holding: ForcedMigrationHolding) =>
        holding.kind !== "order" && holding.state === "unlocking";
      const positions = migrationHoldings.filter(
        (holding) => !isUnlocking(holding)
      );
      const unlocking = migrationHoldings.filter(isUnlocking);
      for (const holding of positions) {
        if (holding.kind === "order") {
          if (migration.fromDenoms.includes(holding.inDenom))
            addValue(holding.inDenom, new Int(holding.remaining));
          if (migration.fromDenoms.includes(holding.outDenom))
            addValue(holding.outDenom, new Int(holding.unclaimed));
        } else {
          for (const coin of holding.coins) {
            if (migration.fromDenoms.includes(coin.denom))
              addValue(coin.denom, new Int(coin.amount));
          }
        }
      }

      for (const denom of migration.fromDenoms) {
        const held = heldByDenom.get(denom);
        if (!held) continue;

        const heldAmount = new Int(held.amount);
        if (!heldAmount.isPositive()) continue;

        // With per-position holdings the bank part is valued on its own
        // below; otherwise the portfolio total stands for everything.
        if (!holdings) {
          const heldFiat = new Dec(held.fiatValue);
          totalFiat = totalFiat.add(heldFiat);
          if (heldFiat.isZero()) hasUnpricedHolding = true;
        }

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
          if (bankAmount.isPositive()) {
            convertibleVariants.push(variant);
            if (holdings) addValue(denom, bankAmount);
          }
        }

        if (!holdings) {
          const elsewhereAmount = heldAmount.sub(bankAmount);
          if (elsewhereAmount.isPositive()) {
            heldElsewhere.push({ ...held, amount: elsewhereAmount.toString() });
          }
        } else if (
          !bankAmount.isPositive() &&
          !migrationHoldings.some((holding) =>
            getHoldingDenoms(holding).includes(denom)
          )
        ) {
          // Held, but neither convertible from the bank (e.g. the variant is
          // missing or its alloy is unavailable) nor in any position row: name
          // it rather than going silent.
          unconvertible.push(held);
          addValue(denom, heldAmount);
        }
      }

      if (
        convertibleVariants.length === 0 &&
        positions.length === 0 &&
        heldElsewhere.length === 0 &&
        unconvertible.length === 0
      )
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
        positions,
        unlocking,
        heldElsewhere,
        unconvertible,
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
