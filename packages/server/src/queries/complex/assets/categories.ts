import {
  Asset,
  AssetCategories as StaticAssetCategories,
} from "@osmosis-labs/types";

import dayjs from "../../../utils/dayjs";

/** Re-exported static asset categories extended with dynamic categories. */
export const AssetCategories = ["new", ...StaticAssetCategories] as const;
export type Category = (typeof AssetCategories)[number];

/** Filters an asset for whether it is included in the given list of categories. */
export function isAssetInCategories(
  asset: Asset,
  categories: Category[],
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
