import {
  IPriceStore,
  ObservableAssetInfoConfig,
  QueriesExternalStore,
} from "@osmosis-labs/stores";
import { useMemo } from "react";

export const useAssetInfoConfig = (
  denom: string,
  queriesExternalStore: QueriesExternalStore,
  priceStore: IPriceStore
) => {
  const assetsInfoConfig = useMemo(
    () =>
      new ObservableAssetInfoConfig(denom, queriesExternalStore, priceStore),
    [denom, queriesExternalStore, priceStore]
  );
  return assetsInfoConfig;
};
