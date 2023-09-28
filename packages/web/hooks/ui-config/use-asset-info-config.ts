import {
  IPriceStore,
  ObservableAssetInfoConfig,
  QueriesExternalStore,
} from "@osmosis-labs/stores";
import { useState } from "react";

export const useAssetInfoConfig = (
  denom: string,
  queriesExternalStore: QueriesExternalStore,
  priceStore: IPriceStore
) => {
  const [assetsInfoConfig] = useState(
    new ObservableAssetInfoConfig(denom, queriesExternalStore, priceStore)
  );
  return assetsInfoConfig;
};
