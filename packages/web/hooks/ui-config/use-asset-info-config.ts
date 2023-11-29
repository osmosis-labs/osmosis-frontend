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
  queryDenom: string | null,
  coingeckoId?: string
) => {
  const assetsInfoConfig = useMemo(
    () =>
      new ObservableAssetInfoConfig(
        denom,
        queriesExternalStore,
        priceStore,
        queryDenom,
        coingeckoId
      ),
    [denom, queriesExternalStore, priceStore, coingeckoId, queryDenom]
  );
  return assetsInfoConfig;
};
