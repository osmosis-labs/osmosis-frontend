import { Asset, AssetList } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils";
import { queryUpcomingAssets } from "../../github";

/** Filters an asset for whether it is included in the given list of categories. */
export function isAssetInCategories(asset: Asset, categories: string[]) {
  return categories.some((category) => {
    // "new" category is an asset with a listing date.
    if (category === "new") {
      return Boolean(asset.listingDate);
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

  const date = assets.find(
    (asset) => asset.coinMinimalDenom === coinMinimalDenom
  )?.listingDate;

  if (date) return new Date(date);
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
