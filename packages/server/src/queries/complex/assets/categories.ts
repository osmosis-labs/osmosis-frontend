import { Asset } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils";
import dayjs from "../../../utils/dayjs";
import { queryUpcomingAssets } from "../../github";

/** Filters an asset for whether it is included in the given list of categories. */
export function isAssetInCategories(
  asset: Asset,
  categories: string[],
  assetNewness = dayjs.duration(2_629_746_000), // default: 1 month
  now = dayjs()
) {
  return categories.some((category) => {
    if (category === "new") {
      if (asset.listingDate) {
        return isAssetNew(asset.listingDate, assetNewness, now);
      }
      // assets without a listing date are not considered new
      return false;
    }

    return asset.categories.includes(category);
  });
}

/** Determines if an asset is new if it has a `listingDate` member. Default: within past month. */
export function isAssetNew(
  listingDate: NonNullable<Asset["listingDate"]>,
  assetNewness = dayjs.duration(2_629_746_000), // default: 1 month
  now = dayjs()
) {
  return now.diff(listingDate) < assetNewness.asMilliseconds();
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
