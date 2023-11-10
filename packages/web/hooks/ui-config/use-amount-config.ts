import { AppCurrency } from "@keplr-wallet/types";
import { AmountConfig, IFeeConfig } from "@osmosis-labs/keplr-hooks";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import { useState } from "react";

/** Maintains a single instance of `AmountConfig` for React view lifecycle.
 *  Updates `chainId`, `sender`, `sendCurrency`, and `feeConfig` on render.
 */
export function useAmountConfig(
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  sender: string,
  feeConfig?: IFeeConfig,
  sendCurrency?: AppCurrency
) {
  const [config] = useState(
    () =>
      new AmountConfig(
        chainGetter,
        queriesStore as IQueriesStore<CosmosQueries>,
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
