import type {
  AppCurrency as KeplrAppCurrency,
  Currency as KeplrBaseCurrency,
} from "@keplr-wallet/types";

export interface AssetList {
  chain_name: string;
  chain_id: string;
  assets: Asset[];
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

export type IbcTransferMethod = {
  name?: string;
  type: "ibc";
  /** Counterparty chain info.
   *  `channelId` here is commonly referred to as "destination channel". */
  counterparty: {
    chainName: string;
    chainId: string;
    sourceDenom: string;
    port: string;
    channelId: string;
  };
  /** Osmosis chain. `channelId` here is commonly
   *  referred to as "source channel". */
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
    evmChainId?: number;
    sourceChainId?: string;
  }[];
  wrappedAssetId?: string;
  unwrappedAssetId?: string;
};

export type ExternalInterfaceBridgeTransferMethod = {
  name: string;
  type: "external_interface";
  depositUrl?: string;
  withdrawUrl?: string;
};

export interface CosmosCounterparty {
  chainType: "cosmos";
  chainId: string;
  chainName: string;
  sourceDenom: string;
  symbol: string;
  decimals: number;
  logoURIs: LogoURIs;
}

export interface EVMCounterparty {
  chainType: "evm";
  chainName: string;
  sourceDenom: string;
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  logoURIs: LogoURIs;
}

export interface NonCosmosCounterparty {
  chainType: "non-cosmos";
  chainName: string;
  sourceDenom: string;
  decimals: number;
  symbol: string;
  logoURIs: LogoURIs;
}

export type Counterparty =
  | CosmosCounterparty
  | EVMCounterparty
  | NonCosmosCounterparty;

export interface Price {
  poolId: string;
  denom: string;
}

export const AssetCategories = [
  "stablecoin",
  "defi",
  "meme",
  "liquid_staking",
] as const;
export type Category = (typeof AssetCategories)[number];

export interface Asset {
  chainName: string;
  /** Denom as represented on source/origin chain. */
  sourceDenom: string;
  /** Denom as represented on Osmosis chain. */
  coinMinimalDenom: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURIs: LogoURIs;
  coingeckoId?: string;

  tooltipMessage?: string;

  sortWith?: {
    chainName: string;
    sourceDenom: string;
  };

  /** "Endorsed", as is currently defined. */
  verified: boolean;
  /** If true is preview only, not ready for production. */
  preview: boolean;
  /** Transfers are unstable. */
  unstable: boolean;
  /** Transfers should not be possible. */
  disabled: boolean;

  categories: Category[];
  /** Data needed for calculating this token's price via Osmosis pools. */
  price?: Price;
  /** The supported methods for transferring this token.
   *  Could be a router API, bespoke bridge, or IBC. */
  transferMethods: (
    | IbcTransferMethod
    | IntegratedBridgeTransferMethod
    | ExternalInterfaceBridgeTransferMethod
  )[];
  /** Token and chain info for the possible chains this token can originate from. */
  counterparty: Counterparty[];
  /** Example: `2024-01-24T10:58:00.000Z` */
  listingDate?: string;

  pegMechanism?: "algorithmic" | "collateralized" | "hybrid";

  /** Add to asset at build time. */
  relative_image_url: string;

  /** Denom key of variant of asset this is grouped with. */
  variantGroupKey?: string;
}
