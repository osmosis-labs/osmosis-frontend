import { useState } from "react";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AmountConfig, IFeeConfig } from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";

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
      new AmountConfig(chainGetter, queriesStore, chainId, sender, feeConfig)
  );
  config.setChain(chainId);
  config.setSender(sender);
  config.setSendCurrency(sendCurrency);
  if (feeConfig) config.setFeeConfig(feeConfig);

  return config;
}
