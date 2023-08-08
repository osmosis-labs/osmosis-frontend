import { IFeeConfig } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import {
  CreatePoolConfigOpts,
  ObservableCreatePoolConfig,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { useState } from "react";

/** Maintains a single instance of `ObservableCreatePoolConfig` for React view lifecycle.
 *  Updates `chainId`, `bech32Address`, and `feeConfig` on render.
 */
export function useCreatePoolConfig(
  chainGetter: ChainGetter,
  chainId: string,
  bech32Address: string,
  queriesStore: IQueriesStore<CosmosQueries & CosmwasmQueries & OsmosisQueries>,
  feeConfig?: IFeeConfig,
  opts?: CreatePoolConfigOpts
) {
  const [config] = useState(
    () =>
      new ObservableCreatePoolConfig(
        chainGetter,
        chainId,
        bech32Address,
        queriesStore,
        queriesStore.get(chainId).queryBalances,
        feeConfig,
        opts
      )
  );
  config.setChain(chainId);
  config.setSender(bech32Address);
  config.setFeeConfig(feeConfig);
  return config;
}
