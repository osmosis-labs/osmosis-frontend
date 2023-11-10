import { AppCurrency } from "@keplr-wallet/types";
import { IFeeConfig, StakedAmountConfig } from "@osmosis-labs/keplr-hooks";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import { useState } from "react";

/** Maintains a single instance of `AmountConfig` for React view lifecycle.
 *  Updates `chainId`, `sender`, `sendCurrency`, and `feeConfig` on render.
 */
export function useStakedAmountConfig(
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore<CosmosQueries>,
  chainId: string,
  sender: string,
  feeConfig?: IFeeConfig,
  sendCurrency?: AppCurrency
) {
  const [config] = useState(
    () =>
      new StakedAmountConfig(
        chainGetter,
        queriesStore,
        chainId,
        sender,
        feeConfig
      )
  );
  config.setChain(chainId);
  config.setSender(sender);
  config.setSendCurrency(sendCurrency);
  if (feeConfig) config.setFeeConfig(feeConfig);

  return config;
}
