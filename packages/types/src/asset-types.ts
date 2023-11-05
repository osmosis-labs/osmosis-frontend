import type {
  AppCurrency as KeplrAppCurrency,
  Currency as KeplrBaseCurrency,
} from "@keplr-wallet/types";

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

export interface ResponseAssetList {
  chain_name: string;
  assets: Omit<Asset, "chain_id">[];
}

export interface AssetList {
  chain_name: string;
  chain_id: string;
  assets: Asset[];
}

interface TraceCounterpartyChain {
  chain_name: string;
  base_denom: string;
}

interface WrappedTrace {
  type: "wrapped";
  counterparty: TraceCounterpartyChain;
  provider: string;
}

interface BridgeTrace {
  type: "bridge";
  counterparty: TraceCounterpartyChain;
  provider: string;
}

interface TraceChain {
  channel_id: string;
  path: string;
}

interface IBCTrace {
  type: "ibc";
  counterparty: TraceCounterpartyChain & {
    channel_id: string;
  };
  chain: TraceChain;
}

interface IbcCW20Trace {
  type: "ibc-cw20";
  counterparty: TraceCounterpartyChain & {
    port: string;
    channel_id: string;
  };
  chain: TraceChain & {
    port: string;
  };
}

export interface Asset {
  description: string;
  denom_units: AssetDenomUnit[];
  base: string;
  name: string;
  display: string;
  symbol: string;
  address?: string;
  traces: (IbcCW20Trace | IBCTrace | BridgeTrace | WrappedTrace)[];
  logo_URIs: LogoURIs;
  coingecko_id: string;
  keywords?: string[];
  origin_chain_name: string;
  origin_chain_id: string;
  price_coin_id?: string;
}

export interface AssetDenomUnit {
  denom: string;
  exponent: number;
  aliases?: string[];
}

interface LogoURIs {
  png: string;
  svg?: string;
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

export type Currency = KeplrBaseCurrency & {
  originCurrency?: KeplrBaseCurrency & {
    pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
    priceCoinId?: string;
  };
};

export type AppCurrency = KeplrAppCurrency & {
  pegMechanism?: "collateralized" | "algorithmic" | "hybrid";
  priceCoinId?: string;
};

export type FeeCurrency = AppCurrency & {
  priceCoinId?: string;
};
