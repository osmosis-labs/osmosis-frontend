import { useState } from "react";
import {
  ChainGetter,
  QueriesStore,
  CosmosQueries,
  CosmwasmQueries,
} from "@keplr-wallet/stores";
import { Pool } from "@osmosis-labs/pools";
import {
  OsmosisQueries,
  ObservableTradeTokenInConfig,
} from "@osmosis-labs/stores";

/** Maintains a single instance of `ObservableTradeTokenInConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `bech32Address`, `pools` on render.
 *  `percentage` default: `"50"`.
 */
export function useTradeTokenInConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  bech32Address: string,
  queriesStore: QueriesStore<[CosmosQueries, CosmwasmQueries, OsmosisQueries]>,
  pools: Pool[]
) {
  const [config] = useState(
    () =>
      new ObservableTradeTokenInConfig(
        chainGetter,
        queriesStore,
        osmosisChainId,
        bech32Address,
        undefined,
        pools
      )
  );
  config.setChain(osmosisChainId);
  config.setSender(bech32Address);
  config.setPools(pools);
  return config;
}
