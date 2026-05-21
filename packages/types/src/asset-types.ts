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
  chainSuggestionDenom?: string;
  sourceDenom?: string;
};

export type FeeCurrency = AppCurrency & {
  gasPriceStep?: GasPriceStep;
  base?: string;
  sourceDenom?: string;
};

interface BaseCurrency {
  readonly coinDenom: string;
  readonly coinDecimals: number;
  readonly coinMinimalDenom: string;
  readonly coinGeckoId?: string;
  readonly coinImageUrl?: string;
}

export type StakeCurrency = BaseCurrency & {
  base?: string;
  // chainSuggestionDenom?: string;
  // sourceDenom?: string;
  originCurrency?: BaseCurrency & {
    pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
  };
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
  logoURIs?: LogoURIs;
}

export interface EVMCounterparty {
  chainType: "evm";
  chainName: string;
  sourceDenom: string;
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  logoURIs?: LogoURIs;
}

export interface NonCosmosCounterparty {
  chainType: "non-cosmos";
  chainName: string;
  sourceDenom: string;
  decimals: number;
  symbol: string;
  logoURIs?: LogoURIs;
}

export type Counterparty =
  | CosmosCounterparty
  | EVMCounterparty
  | NonCosmosCounterparty;

export interface Price {
  poolId: string;
  denom: string;
}

export interface Asset {
  chainName: string;
  /** Denom as represented on source/origin chain. */
  sourceDenom: string;
  /** Denom as represented on Osmosis chain. */
  coinMinimalDenom: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURIs?: LogoURIs;
  coingeckoId?: string;

  tooltipMessage?: string;

  sortWith?: {
    chainName: string;
    sourceDenom: string;
  };

  /** Flag indicating if this asset is an alloyed asset. */
  isAlloyed: boolean;
  /** Contract address of alloyed asset CW pool. */
  contract?: string;

  /** "Endorsed", as is currently defined. */
  verified: boolean;
  /** If true is preview only, not ready for production. */
  preview: boolean;
  /** Warning-only flag indicating the asset's transfer path has been unstable.
   *  Does not gate any UI; surfaces a banner / icon. */
  unstable: boolean;
  /** Closed-set reason for `unstable`. Each value has a localised string.
   *  Free-form curator context, when present, lives in the shared
   *  `tooltipMessage` field. */
  unstableReason?: "ibc_client" | "source_chain_killed" | "market" | "manual";
  /** ISO UTC timestamp of the start of the most recent unstable incident.
   *  Anchors the 60/90-day lifecycle clock in the assetlists repo. */
  lastDowntimeDate?: string;
  /** ISO UTC timestamp of the most recent recovery, if the asset has
   *  recovered since `lastDowntimeDate`. */
  lastRecoveryDate?: string;
  /** Internal-deposit UX override: skip native flow, route user to an
   *  external provider (e.g. Composable, Wormhole). Unchanged semantics. */
  disabled: boolean;
  /** Deposits are halted (kill switch, distinct from `disabled`). The
   *  asset-page Deposit button is greyed and the bridge flow blocks the
   *  deposit direction. */
  haltDeposits?: boolean;
  /** Closed-set reason for the deposit halt; drives the localised banner. */
  depositHaltReason?:
    | "bridge_down"
    | "extended_unstable_market"
    | "planned_shutdown"
    | "source_chain_killed"
    | "manual";
  /** Withdrawals are halted (kill switch). */
  haltWithdrawals?: boolean;
  /** Closed-set reason for the withdrawal halt; drives the localised banner. */
  withdrawalHaltReason?: "bridge_down" | "source_chain_killed" | "manual";
  /** ISO UTC date when this asset is scheduled to be shut down. */
  plannedShutdownDate?: string;

  categories: string[];
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

export type MinimalAsset = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  coinImageUrl?: string;
  /**
   * This is used to fetch asset's fiat value from coingecko.
   * You can get id from https://api.coingecko.com/api/v3/coins/list.
   */
  coinGeckoId: string | undefined;
  coinName: string;
  chainSuggestionDenom?: string;
  /** Transfers are allowed, but unstable. */
  isUnstable: boolean;
  /** Closed-set reason for `isUnstable`; drives the localised banner.
   *  Free-form curator context lives in the shared `tooltipMessage` field. */
  unstableReason?: "ibc_client" | "source_chain_killed" | "market" | "manual";
  /** ISO UTC start of the current unstable incident. */
  lastDowntimeDate?: string;
  /** ISO UTC recovery timestamp, if any. */
  lastRecoveryDate?: string;
  /** Native transfer flow is skipped; user is routed to external providers. */
  areTransfersDisabled: boolean;
  /** Deposits are halted (kill switch); asset-page Deposit button should be greyed. */
  areDepositsHalted: boolean;
  /** Closed-set reason for the deposit halt. */
  depositHaltReason?:
    | "bridge_down"
    | "extended_unstable_market"
    | "planned_shutdown"
    | "source_chain_killed"
    | "manual";
  /** Withdrawals are halted (kill switch); asset-page Withdraw button should be greyed. */
  areWithdrawalsHalted: boolean;
  /** Closed-set reason for the withdrawal halt. */
  withdrawalHaltReason?: "bridge_down" | "source_chain_killed" | "manual";
  /** ISO UTC date when this asset is scheduled to be shut down. */
  plannedShutdownDate?: string;
  /** Is verified by community. */
  isVerified: boolean;
  /** Flag indicating if this asset is an alloyed asset. */
  isAlloyed: boolean;
  /** Contract address of alloyed asset CW pool. */
  contract?: string;
  variantGroupKey: string | undefined;
  /** Optional tooltip message to display for this asset. */
  tooltipMessage?: string;
};
