import { useMemo } from "react";
import { ObservableAmountConfig } from "@osmosis-labs/stores";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";

export const useAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  sender: string,
  currency: AppCurrency
) =>
  useMemo(() => {
    const config = new ObservableAmountConfig(
      chainGetter,
      queriesStore,
      chainId,
      sender,
      currency
    );
    config.setChain(chainId);
    config.setSender(sender);
    config.setCurrency(currency);
    return config;
  }, [chainGetter, queriesStore, chainId, sender, currency]);
