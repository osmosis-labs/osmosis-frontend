import type { ChainInfo as BaseChainInfo } from "@keplr-wallet/types";

import type { AppCurrency, FeeCurrency, StakeCurrency } from "./asset-types";

export interface ChainList {
  zone: string;
  chains: Chain[];
}

export interface Chain {
  chain_name: string;
  status: string;
  network_type: string;
  pretty_name: string;
  chain_id: string;
  description?: string;
  bech32_prefix: string;
  bech32_config: Bech32Config;
  slip44: number;
  alternative_slip44s?: number[];
  fees: {
    fee_tokens: FeeToken[];
  };
  staking: {
    staking_tokens: StakingToken[];
    lock_duration?: LockDuration;
  };
  apis: {
    rpc: Api[];
    rest: Api[];
  };
  explorers: Explorer[];
  features: string[];
}

interface Bech32Config {
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
}

interface FeeToken {
  denom: string;
  fixed_min_gas_price?: number;
  low_gas_price?: number;
  average_gas_price?: number;
  high_gas_price?: number;
  gas_costs?: {
    cosmos_send: number;
    ibc_transfer: number;
  };
}

interface StakingToken {
  denom: string;
}

interface LockDuration {
  time: string;
}

interface Api {
  address: string;
}

interface Explorer {
  tx_page: string;
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
