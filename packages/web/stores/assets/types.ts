import { CoinPretty, PricePretty } from "@keplr-wallet/unit";

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
  // If the asset is from ics20-cw20
  ics20ContractAddress?: string;

  // If this is a multihop ibc, need to special case because the denom on osmosis
  // isn't H(source_denom), but rather H(ibc_path)
  ibcTransferPathDenom?: string;
}

export interface CoinBalance {
  balance: CoinPretty;
  fiatValue?: PricePretty;
}

export interface IBCChainIdentity {
  chainId: string;
  chainName: string;
}

export interface IBCBalance extends CoinBalance {
  chainInfo: IBCChainIdentity;
  sourceChannelId: string;
  destChannelId: string;
  isUnstable?: boolean;
}

export interface IBCCW20ContractBalance extends IBCBalance {
  ics20ContractAddress: string;
}
