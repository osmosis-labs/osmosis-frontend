import { useEffect, useState } from "react";
import {
  ChainGetter,
  QueriesStore,
  CosmosQueries,
  CosmwasmQueries,
  ICNSQueries,
} from "@keplr-wallet/stores";
import { Pool } from "@osmosis-labs/pools";
import {
  OsmosisQueries,
  ObservableTradeTokenInConfig,
} from "@osmosis-labs/stores";

/** Maintains a single instance of `ObservableTradeTokenInConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `bech32Address`, `pools` on render.
 *  `percentage` default: `"50"`.
 * `requeryIntervalMs` specifies how often to refetch pool data based on current tokens.
 */
export function useTradeTokenInConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  bech32Address: string,
  queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, OsmosisQueries, ICNSQueries]
  >,
  pools: Pool[],
  requeryIntervalMs = 8000
) {
  const queriesOsmosis = queriesStore.get(osmosisChainId).osmosis!;

  const [config] = useState(
    () =>
      new ObservableTradeTokenInConfig(
        chainGetter,
        queriesStore,
        osmosisChainId,
        bech32Address,
        undefined,
        pools,
        undefined,
        {
          send: {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
          },
          out: {
            coinDenom: "OSMO",
            coinMinimalDenom: "uosmo",
            coinDecimals: 6,
          },
        }
      )
  );

  // refresh relevant pool data every `requeryIntervalMs` period
  useEffect(() => {
    const interval = setInterval(() => {
      const poolIds = config.optimizedRoutePaths
        .map((route) => route.pools.map((pool) => pool.id))
        .flat();

      poolIds.forEach((poolId) => {
        queriesStore
          .get(osmosisChainId)
          .osmosis!.queryGammPools.getPool(poolId)
          ?.fetch();
      });
    }, requeryIntervalMs);
    return () => clearInterval(interval);
  }, [
    config.optimizedRoutePaths,
    osmosisChainId,
    queriesStore,
    requeryIntervalMs,
  ]);

  useEffect(() => {
    config.setIncentivizedPoolIds(
      queriesOsmosis.queryIncentivizedPools.incentivizedPools
    );
  }, [queriesOsmosis.queryIncentivizedPools.response]);

  config.setChain(osmosisChainId);
  config.setSender(bech32Address);
  config.setPools(pools);
  return config;
}
