import type { ChainInfo as BaseChainInfo } from "@keplr-wallet/types";

import type { AppCurrency, FeeCurrency } from "./asset-types";

export interface ChainInfo extends BaseChainInfo {
  prettyChainName: string;
}

export interface ChainInfoWithExplorer extends ChainInfo {
  /** Formed as "https://explorer.com/{txHash}" */
  explorerUrlToTx: string;
  /** Add optional stable coin peg info to currencies. */
  currencies: AppCurrency[];
  feeCurrencies: FeeCurrency[];
}
