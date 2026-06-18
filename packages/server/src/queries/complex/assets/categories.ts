import { Asset, AssetList } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils";
import { queryUpcomingAssets } from "../../github";

/** An asset is considered "new" for this many ms after its listing date. */
export const NEW_ASSET_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** Parses a raw listing date to epoch ms, or undefined if missing/unparseable. */
function parseListingDate(listingDate: string | undefined): number | undefined {
  if (!listingDate) return undefined;
  const ms = new Date(listingDate).getTime();
  return Number.isNaN(ms) ? undefined : ms;
}

/** Filters an asset for whether it is included in the given list of categories. */
export function isAssetInCategories(asset: Asset, categories: string[]) {
  return categories.some((category) => {
    // "new" category is an asset listed within the last NEW_ASSET_WINDOW_MS.
    if (category === "new") {
      const listed = parseListingDate(asset.listingDate);
      if (listed === undefined) return false;
      return Date.now() - listed <= NEW_ASSET_WINDOW_MS;
    }

    return asset.categories.includes(category);
  });
}

export function getAssetListingDate({
  assetLists,
  coinMinimalDenom,
}: {
  assetLists: AssetList[];
  coinMinimalDenom: string;
}): Date | undefined {
  const assets = assetLists.flatMap(({ assets }) => assets);

  const listed = parseListingDate(
    assets.find((asset) => asset.coinMinimalDenom === coinMinimalDenom)
      ?.listingDate
  );

  if (listed !== undefined) return new Date(listed);
}

const upcomingAssetsCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);
export function getUpcomingAssets() {
  return cachified({
    cache: upcomingAssetsCache,
    key: "upcoming-assets",
    ttl: 1000 * 60 * 5, // 5 minutes
    getFreshValue: () =>
      queryUpcomingAssets().then(({ upcomingAssets }) => upcomingAssets),
  });
}
