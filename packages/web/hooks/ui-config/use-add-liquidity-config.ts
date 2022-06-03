import { useState } from "react";
import {
  ChainGetter,
  QueriesStore,
  CosmosQueries,
  CosmwasmQueries,
} from "@keplr-wallet/stores";
import {
  OsmosisQueries,
  ObservableAddLiquidityConfig,
} from "@osmosis-labs/stores";

/** Maintains a single instance of `ObservableAddLiquidityConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `poolId`, `bech32Address`, and `queryOsmosis.queryGammPoolShare` on render.
 */
export function useAddLiquidityConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  poolId: string,
  bech32Address: string,
  queriesStore: QueriesStore<[CosmosQueries, CosmwasmQueries, OsmosisQueries]>
) {
  const queryOsmosis = queriesStore.get(osmosisChainId).osmosis!;
  const [config] = useState(
    () =>
      new ObservableAddLiquidityConfig(
        chainGetter,
        osmosisChainId,
        poolId,
        bech32Address,
        queriesStore,
        queryOsmosis.queryGammPoolShare,
        queryOsmosis.queryGammPools,
        queriesStore.get(osmosisChainId).queryBalances
      )
  );
  config.setChain(osmosisChainId);
  config.setSender(bech32Address);
  config.setPoolId(poolId);
  config.setQueryPoolShare(queryOsmosis.queryGammPoolShare);
  return config;
}
