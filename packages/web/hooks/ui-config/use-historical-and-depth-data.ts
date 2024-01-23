import { useEffect, useState } from "react";

import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/derived-data/concentrated-liquidity";
import { api } from "~/utils/trpc";

export function useHistoricalAndLiquidityData(
  osmosisChainId: string,
  poolId: string
): ObservableHistoricalAndLiquidityData {
  const { queriesStore, chainStore } = useStore();

  const osmosisQueries = queriesStore.get(osmosisChainId).osmosis!;

  const [config] = useState(
    () =>
      new ObservableHistoricalAndLiquidityData(
        chainStore,
        osmosisChainId,
        poolId,
        queriesStore,
        osmosisQueries.queryLiquiditiesPerTickRange.getForPoolId(poolId),
        osmosisQueries.queryCfmmConcentratedPoolLinks
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

  const { data: pool } = api.edge.pools.getPool.useQuery(
    {
      poolId,
    },
    {
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  if (pool) config.setPool(pool);

  const {
    data: historicalPriceData,
    isLoading,
    isError,
  } = api.edge.assets.getAssetPairHistoricalPrice.useQuery(
    {
      poolId,
      baseCoinMinimalDenom:
        pool?.reserveCoins[0].currency.coinMinimalDenom ?? "",
      quoteCoinMinimalDenom:
        pool?.reserveCoins[1].currency.coinMinimalDenom ?? "",
      timeDuration: config.historicalRange,
    },
    {
      enabled: Boolean(pool),
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  if (historicalPriceData) config.setHistoricalData(historicalPriceData.prices);
  config.setIsHistoricalDataLoading(isLoading);
  config.setHistoricalDataError(isError);

  return config;
}
