import { shorten } from "@osmosis-labs/utils";

/**
 * Banner fields shared between the top announcement banner and asset alerts,
 * as authored in the osmosis-labs/fe-content repo.
 */
export interface CMSBannerFields {
  enTextOrLocalizationPath: string;
  /** Persists dismissal under this key. */
  localStorageKey?: string;
  link?: {
    enTextOrLocalizationKey: string;
    url: string;
    isExternal: boolean;
  };
  isWarning?: boolean;
  persistent?: boolean;
  bg?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Asset alerts are urgent, denom-gated announcements (e.g. a bridge or
 * protocol sunsetting) sourced from the osmosis-labs/fe-content repo.
 * An alert is only shown to users holding one of its denoms anywhere on
 * Osmosis (bank balances, staked, in-locks, unclaimed rewards, or pooled),
 * on every page (unlike the announcement banner, there is no `pageRoute`).
 * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/asset-alerts.json
 */
export interface AssetAlert {
  /** Minimal denoms (e.g. `ibc/HASH`) that trigger this alert when held. */
  denoms: string[];
  banner: CMSBannerFields & {
    /** Persists dismissal, and must be unique per alert. */
    localStorageKey: string;
  };
  localization?: Record<string, Record<string, any>>;
}

export interface AssetAlertsResponse {
  alerts: AssetAlert[];
}

/** An asset the user holds anywhere on Osmosis, with its display symbol
 *  when the asset is listed. Shape matches `HeldAsset` from the portfolio
 *  query in `@osmosis-labs/server`. */
export interface HeldAsset {
  denom: string;
  coinDenom?: string;
}

export type ActiveAssetAlert = AssetAlert & {
  /** The held assets that triggered this alert. */
  matchedAssets: HeldAsset[];
};

/**
 * Filters alerts down to those within their date range and matching a denom
 * the user holds, pairing each with the held assets that triggered it.
 * Dismissal and feature flag gating are left to the caller.
 */
export function getActiveAssetAlerts({
  alerts,
  heldAssets,
  now = new Date(),
}: {
  alerts: AssetAlert[] | undefined;
  heldAssets: HeldAsset[];
  now?: Date;
}): ActiveAssetAlert[] {
  if (!alerts || heldAssets.length === 0) return [];

  const heldByDenom = new Map(heldAssets.map((asset) => [asset.denom, asset]));

  return alerts
    .map((alert) => ({
      ...alert,
      matchedAssets: alert.denoms
        .map((denom) => heldByDenom.get(denom))
        .filter((asset): asset is HeldAsset => Boolean(asset)),
    }))
    .filter(
      (alert) =>
        alert.matchedAssets.length > 0 && isAlertWithinDateRange(alert, now)
    );
}

/** Keep urgent banner copy concise when many assets trigger one alert. */
const DEFAULT_MAX_LISTED_SYMBOLS = 5;

/** Display list of the held symbols that triggered an alert, e.g.
 *  "DOGE.int3, LTC.int3". Falls back to a shortened denom when unlisted, and
 *  summarizes beyond `maxListed` with a locale-neutral "+N" suffix so the
 *  banner text stays near one line. */
export function getMatchedSymbolsText(
  alert: ActiveAssetAlert,
  maxListed = DEFAULT_MAX_LISTED_SYMBOLS
): string {
  const symbols = alert.matchedAssets.map(
    (asset) => asset.coinDenom ?? shorten(asset.denom)
  );

  if (symbols.length <= maxListed) return symbols.join(", ");

  return `${symbols.slice(0, maxListed).join(", ")} +${
    symbols.length - maxListed
  }`;
}

/**
 * Replaces `{key}` placeholders in CMS banner text, e.g. a `{symbols}`
 * placeholder in an alert's localized header. Text without placeholders is
 * returned unchanged, so interpolation is opt-in per CMS entry.
 */
export function interpolateBannerText(
  text: string,
  interpolations: Record<string, string>
): string {
  return Object.entries(interpolations).reduce(
    (acc, [key, value]) => acc.split(`{${key}}`).join(value),
    text
  );
}

/** Within range when now is past `startDate` and before `endDate`; a missing
 *  bound is treated as unbounded. */
export function isAlertWithinDateRange(
  { banner: { startDate, endDate } }: AssetAlert,
  now: Date
): boolean {
  if (startDate && now < new Date(startDate)) return false;
  if (endDate && now >= new Date(endDate)) return false;
  return true;
}
