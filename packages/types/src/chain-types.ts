import type {
  AppCurrency as KeplrAppCurrency,
  ChainInfo as BaseChainInfo,
} from "@keplr-wallet/types";

export type AppCurrency = KeplrAppCurrency & {
  pegMechanism?: "collateralized" | "algorithmic" | "hybrid";
  priceCoinId?: string;
};

export type FeeCurrency = AppCurrency & {
  priceCoinId?: string;
};

export interface ChainInfo extends BaseChainInfo {
  prettyChainName: string;
}

export interface ChainInfoWithExplorer extends ChainInfo {
  /** Formed as "https://explorer.com/{txHash}" */
  explorerUrlToTx: string;
  /** Add optional stable coin peg info to currencies. */
  currencies: AppCurrency[];
  feeCurrencies: FeeCurrency[];
  /** Unique ID for the chain within the Axelar network */
  axelarChainId?: string;
}
