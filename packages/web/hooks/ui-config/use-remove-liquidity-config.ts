import { useState } from "react";
import {
  ChainGetter,
  QueriesStore,
  CosmosQueries,
  CosmwasmQueries,
} from "@keplr-wallet/stores";
import {
  OsmosisQueries,
  ObservableRemoveLiquidityConfig,
} from "@osmosis-labs/stores";

/** Maintains a single instance of `ObservableRemoveLiquidityConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `poolId`, `bech32Address`, `queryOsmosis.queryGammPoolShare`, and `percentage` on render.
 *  `percentage` default: `"50"`.
 */
export function useRemoveLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string,
  bech32Address: string,
  queriesStore: QueriesStore<[CosmosQueries, CosmwasmQueries, OsmosisQueries]>,
  percentage = "50"
) {
  const queryOsmosis = queriesStore.get(osmosisChainId).osmosis!;
  const [config] = useState(
    () =>
      new ObservableRemoveLiquidityConfig(
        chainGetter,
        osmosisChainId,
        poolId,
        bech32Address,
        queriesStore,
        queryOsmosis.queryGammPoolShare,
        queryOsmosis.queryGammPools,
        percentage
      )
  );
  config.setChain(osmosisChainId);
  config.setSender(bech32Address);
  config.setPoolId(poolId);
  config.setQueryPoolShare(queryOsmosis.queryGammPoolShare);
  config.setPercentage(percentage);
  return config;
}
