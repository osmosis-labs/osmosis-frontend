import { MinimalAsset } from "@osmosis-labs/types";
import { useCallback } from "react";

import { api } from "~/utils/trpc";

/** Gets recommended assets directly from asset list. */
export function useRecommendedAssets(
  fromCoinMinimalDenom?: string,
  toCoinMinimalDenom?: string
) {
  const { data: recommendedAssets } =
    api.local.assets.getSwapRecommendedAssets.useQuery(undefined, {
      select: useCallback(
        (data: MinimalAsset[]) =>
          data.filter(
            (asset: MinimalAsset) =>
              asset.coinMinimalDenom !== fromCoinMinimalDenom &&
              asset.coinMinimalDenom !== toCoinMinimalDenom
          ),
        [fromCoinMinimalDenom, toCoinMinimalDenom]
      ),
    });
  return recommendedAssets;
}
