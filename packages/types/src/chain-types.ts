import type { ChainInfo as BaseChainInfo } from "@keplr-wallet/types";

import type {
  AppCurrency,
  FeeCurrency,
  MinimalAsset,
  StakeCurrency,
} from "./asset-types";

export interface ChainList {
  zone: string;
  chains: Chain[];
}

export interface Chain {
  chain_name: string;
  status: string;
  networkType: string;
  prettyName: string;
  chain_id: string;
  description?: string;
  bech32Prefix: string;
  bech32Config: Bech32Config;
  slip44: number;
  alternativeSlip44s?: number[];
  logo_URIs?: {
    png?: string;
    svg?: string;
  };
  feeCurrencies: FeeToken[];
  stakeCurrency?: StakeCurrency;
  currencies: ChainCurrency[];
  apis: {
    rpc: Api[];
    rest: Api[];
  };
  explorers: Explorer[];
  features: string[];
  /**
   * Needed for CosmosKit to function correctly, otherwise
   * chain suggestion won't work.
   */
  fees?: {
    fee_tokens: FeeToken[];
  };
  staking?: {
    staking_tokens: StakeCurrency[];
  };
  keplrChain?: ChainInfoWithExplorer;
}

interface Bech32Config {
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
}

interface FeeToken
  extends Omit<
    MinimalAsset,
    | "isUnstable"
    | "coinName"
    | "isUnstable"
    | "areTransfersDisabled"
    | "isVerified"
    | "isAlloyed"
    | "variantGroupKey"
    | "coinGeckoId"
    | "coinMinimalDenom"
  > {
  coinMinimalDenom?: string;
  coinGeckoId?: string;
  contractAddress?: string;
  sourceDenom?: string;
  gasPriceStep?: {
    low?: number;
    average?: number;
    high?: number;
  };
  gasCosts?: {
    cosmosSend?: number;
    ibcTransfer?: number;
  };
  /**
   * Needed for CosmosKit to function correctly, otherwise
   * chain suggestion won't work correctly.
   */
  denom?: string;
  fixed_min_gas_price?: number;
  low_gas_price?: number;
  average_gas_price?: number;
  high_gas_price?: number;
}

interface ChainCurrency
  extends Omit<
    MinimalAsset,
    | "isUnstable"
    | "coinName"
    | "isUnstable"
    | "areTransfersDisabled"
    | "isVerified"
    | "isAlloyed"
    | "variantGroupKey"
    | "coinGeckoId"
    | "coinMinimalDenom"
  > {
  coinMinimalDenom?: string;
  coinGeckoId?: string;
  contractAddress?: string;
  sourceDenom?: string;
}

interface Api {
  address: string;
}

interface Explorer {
  txPage: string;
}

export interface ChainInfo extends BaseChainInfo {
  prettyChainName: string;
}

export interface ChainInfoWithExplorer extends ChainInfo {
  /** Formed as "https://explorer.com/{txHash}" */
  explorerUrlToTx: string;
  /** Add optional stable coin peg info to currencies. */
  currencies: AppCurrency[];
  feeCurrencies: FeeCurrency[];
  stakeCurrency: StakeCurrency;
}
