import { useState } from "react";

import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/charts/historical-and-liquidity-data";

export function useHistoricalAndLiquidityData(
  osmosisChainId: string,
  poolId: string
): ObservableHistoricalAndLiquidityData {
  const { queriesExternalStore, queriesStore, chainStore } = useStore();

  const [config] = useState(
    () =>
      new ObservableHistoricalAndLiquidityData(
        chainStore,
        osmosisChainId,
        poolId,
        queriesStore,
        queriesStore
          .get(osmosisChainId)
          .osmosis!.queryLiquiditiesPerTickRange.getForPoolId(poolId),
        queriesExternalStore.queryTokenPairHistoricalChart
      )
  );

  return config;
}
