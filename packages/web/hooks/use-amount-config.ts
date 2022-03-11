import { useMemo } from "react";
import { ObservableAmountConfig } from "@osmosis-labs/stores";
import { ChainGetter, ObservableQueryBalances } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";

export const useAmountConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  currency: AppCurrency,
  queryBalances: ObservableQueryBalances
) =>
  useMemo(() => {
    const config = new ObservableAmountConfig(
      chainGetter,
      chainId,
      sender,
      currency,
      queryBalances
    );
    config.setChain(chainId);
    config.setQueryBalances(queryBalances);
    config.setSender(sender);
    config.setCurrency(currency);
    return config;
  }, [chainGetter, chainId, sender, currency, queryBalances]);
