import type {
  AppCurrency as KeplrAppCurrency,
  Currency as KeplrBaseCurrency,
} from "@keplr-wallet/types";

export interface AssetList {
  chain_name: string;
  chain_id: string;
  assets: Asset[];
}

export interface AssetDenomUnit {
  denom: string;
  exponent: number;
  aliases?: string[];
}

interface GasPriceStep {
  low: number;
  average: number;
  high: number;
}

export type Currency = KeplrBaseCurrency & {
  originCurrency?: KeplrBaseCurrency & {
    pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
  };
};

export type AppCurrency = KeplrAppCurrency & {
  pegMechanism?: "collateralized" | "algorithmic" | "hybrid";
  base?: string;
  gasPriceStep?: GasPriceStep;
};

export type FeeCurrency = AppCurrency & {
  gasPriceStep?: GasPriceStep;
  base?: string;
};

export type StakeCurrency = Currency & {
  base?: string;
};

export interface LogoURIs {
  svg?: string;
  png?: string;
}

export interface TransferMethodChain {
  port: string;
  channelId: string;
  path?: string;
}

export type IbcTransferMethod = {
  type: "ibc";
  counterparty: {
    chainName: string;
    sourceDenom: string;
    port: string;
    channelId: string;
  };
  chain: {
    port: string;
    channelId: string;
    path: string;
  };
};

export type IntegratedBridgeTransferMethod = {
  name: string;
  type: "integrated_bridge";
  counterparty: {
    /** If asset is wrapped */
    wrappedAssetId?: string;
    unwrappedAssetId: string;
    evmChainId: number;
    sourceChainId: string;
  }[];
};

export type ExternalInterfaceBridgeTransferMethod = {
  name: string;
  type: "external_interface";
  depositUrl: string;
  withdrawUrl: string;
};

export interface Counterparty {
  chainName: string;
  sourceDenom: string;
  chainType: "cosmos" | "evm";
  chainId: string;
  symbol: string;
  decimals: number;
  logoURIs: LogoURIs;
  address?: string;
}

export interface RelatedAsset {
  chainName: string;
  sourceDenom: string;
}

export interface Price {
  pool: string;
  denom: string;
}

export type Category = "stablecoin" | "defi" | "meme" | "liquid_staking";

export interface Asset {
  chainName: string;
  sourceDenom: string;
  coinMinimalDenom: string;
  symbol: string;
  decimals: number;
  logoURIs: LogoURIs;
  coingeckoId: string;
  verified: boolean;
  categories: Category[];
  price?: Price;
  transferMethods: (
    | IbcTransferMethod
    | IntegratedBridgeTransferMethod
    | ExternalInterfaceBridgeTransferMethod
  )[];
  counterparty: Counterparty[];
  name: string;
  relatedAssets: RelatedAsset[];
}
