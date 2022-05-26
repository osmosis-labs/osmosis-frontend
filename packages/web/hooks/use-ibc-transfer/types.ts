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
