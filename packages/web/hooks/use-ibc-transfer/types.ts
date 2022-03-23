import { IBCCurrency } from "@keplr-wallet/types";

export interface IbcTransfer {
  currency: IBCCurrency;
  counterpartyChainId: string;
  sourceChannelId: string;
  destChannelId: string;
  isWithdraw: boolean;
  ics20ContractAddress?: string;
}

export interface CustomCounterpartyConfig {
  bech32Address: string;
  isValid: boolean;
  setBech32Address: (bech32Address: string) => void;
}

/*
setDialogState({
                    open: true,
                    counterpartyChainId: bal.chainInfo.chainId,
                    currency: currency as IBCCurrency,
                    sourceChannelId: bal.sourceChannelId,
                    destChannelId: bal.destChannelId,
                    isWithdraw: false,
                    ics20ContractAddress: bal.ics20ContractAddress,
                  });
                }}
                onWithdraw={() => {
                  setDialogState({
                    open: true,
                    counterpartyChainId: bal.chainInfo.chainId,
                    currency: currency as IBCCurrency,
                    sourceChannelId: bal.sourceChannelId,
                    destChannelId: bal.destChannelId,
                    isWithdraw: true,
                    ics20ContractAddress: bal.ics20ContractAddress,
                  });
                  */
