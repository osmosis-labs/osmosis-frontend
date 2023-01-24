import { useEffect, useState } from "react";
import {
  ChainGetter,
  QueriesStore,
  CosmosQueries,
  CosmwasmQueries,
} from "@keplr-wallet/stores";
import { Pool } from "@osmosis-labs/pools";
import {
  OsmosisQueries,
  ObservableOrderTokenInConfig,
} from "@osmosis-labs/stores";

/** Maintains a single instance of `ObservableTradeTokenInConfig` for React view lifecycle.
 *  Updates `osmosisChainId`, `bech32Address`, `pools` on render.
 *  `percentage` default: `"50"`.
 * `requeryIntervalMs` specifies how often to refetch pool data based on current tokens.
 */
export function useOrderTokenInConfig(
  chainGetter: ChainGetter,
  osmosisChainId: string,
  bech32Address: string,
  queriesStore: QueriesStore<[CosmosQueries, CosmwasmQueries, OsmosisQueries]>,
  pools: Pool[],
  requeryIntervalMs = 8000
) {
  const [config] = useState(
    () =>
      new ObservableOrderTokenInConfig(
        chainGetter,
        queriesStore,
        // @ts-ignore
        queriesStore.get(osmosisChainId).osmosis!.queryGammPools,
        osmosisChainId,
        bech32Address,
        undefined,
        pools
      )
  );

  useEffect(() => {
    const interval = setInterval(() => {
      config.requery();
    }, requeryIntervalMs);
    return () => clearInterval(interval);
  });

  config.setChain(osmosisChainId);
  config.setSender(bech32Address);
  config.setPools(pools);
  return config;
}
