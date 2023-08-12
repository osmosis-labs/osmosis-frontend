import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";

import { FiatRampKey, OriginBridgeInfo } from "~/integrations/bridge-info";

export interface IBCAsset {
  counterpartyChainId: string;
  // Souce channel id based on the Osmosis chain
  sourceChannelId: string;
  // Destination channel id from Osmosis chain
  destChannelId: string;
  coinMinimalDenom: string;
  // In some reasons, ibc channel is in unstable status.
  // Disable the deposit, withdraw button and show the tooltip.
  isUnstable?: boolean;

  /** Is asset incentivized or strategically worth including in main vs frontier (permissionless). */
  isVerified?: boolean;
  // If the asset is from ics20-cw20
  ics20ContractAddress?: string;

  // If this is a multihop ibc, need to special case because the denom on osmosis
  // isn't H(source_denom), but rather H(ibc_path)
  ibcTransferPathDenom?: string;

  /** Additional info to support non-IBC bridge integration. */
  originBridgeInfo?: OriginBridgeInfo;

  /** Keys for fiat on/off ramps. Ramp must accept asset's major denom (e.g. `ATOM`). */
  fiatRamps?: { rampKey: FiatRampKey; assetKey: string }[];
}

export interface CoinBalance {
  balance: CoinPretty & {
    currency: PeggedCurrency;
  };
  fiatValue?: PricePretty;
}

export interface IBCChainIdentity {
  chainId: string;
  chainName: string;
}

export type FeeCurrency = AppCurrency & {
  gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
};

export type PeggedCurrency = AppCurrency & {
  originCurrency?: AppCurrency & {
    /** For assets that are pegged/stablecoins. */
    /**Fiat-backed: Backed by traditional fiat reserves (USD/Euro/GBP etc), ensuring a steady 1:1 peg and reduced volatility.

Algorithmic: Uses algorithms and contracts to adjust supply based on demand, maintaining value stability during market fluctuations.

Crypto-backed: Collateralized by cryptocurrencies, offering stability through locked assets and allowing stablecoin creation.

Hybrid-pegged: Combines fiat, cryptocurrencies, while also utilizing algorithmic mechanisms to maintain its stability. */
    pegMechanism?:
      | "fiat-backed"
      | "algorithmic"
      | "crypto-backed"
      | "hybrid-pegged";
  };
};

export interface IBCBalance extends CoinBalance {
  chainInfo: IBCChainIdentity;
  sourceChannelId: string;
  destChannelId: string;
  isUnstable?: boolean;
  isVerified: boolean;
  originBridgeInfo?: OriginBridgeInfo;
  fiatRamps?: { rampKey: FiatRampKey; assetKey: string }[];
}

export interface IBCCW20ContractBalance extends IBCBalance {
  ics20ContractAddress: string;
}
