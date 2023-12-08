import { useEffect, useState } from "react";

import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/derived-data/concentrated-liquidity";

export function useHistoricalAndLiquidityData(
  osmosisChainId: string,
  poolId: string
): ObservableHistoricalAndLiquidityData {
  const { queriesExternalStore, queriesStore, chainStore } = useStore();

  const osmosisQueries = queriesStore.get(osmosisChainId).osmosis!;

  const [config] = useState(
    () =>
      new ObservableHistoricalAndLiquidityData(
        chainStore,
        osmosisChainId,
        poolId,
        queriesStore,
        osmosisQueries.queryLiquiditiesPerTickRange.getForPoolId(poolId),
        osmosisQueries.queryCfmmConcentratedPoolLinks,
        queriesExternalStore.queryTokenPairHistoricalChart
      )
  );
  // react dev tools will unmount the component so only dispose if
  // in production environment, where the component will only unmount once
  useEffect(
    () => () => {
      if (process.env.NODE_ENV === "production") {
        config.dispose();
      }
    },
    [config]
  );

  return config;
}
