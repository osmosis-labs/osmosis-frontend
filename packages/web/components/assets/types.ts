import { RatePretty } from "@keplr-wallet/unit";

export type AssetInfo = {
  coinImageUrl: string | undefined;
  coinDenom: string;
};

export type TokenInfo = {
  coinDenom: string;
  networkName?: string;
  poolShare?: RatePretty;
};
