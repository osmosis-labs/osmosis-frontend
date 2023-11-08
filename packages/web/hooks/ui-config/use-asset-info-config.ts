import {
  IPriceStore,
  ObservableAssetInfoConfig,
  QueriesExternalStore,
} from "@osmosis-labs/stores";
import { useMemo } from "react";

export const useAssetInfoConfig = (
  denom: string,
  queriesExternalStore: QueriesExternalStore,
  priceStore: IPriceStore,
  coingeckoId?: string
) => {
  const assetsInfoConfig = useMemo(
    () =>
      new ObservableAssetInfoConfig(
        denom,
        queriesExternalStore,
        priceStore,
        coingeckoId
      ),
    [denom, queriesExternalStore, priceStore, coingeckoId]
  );
  return assetsInfoConfig;
};
