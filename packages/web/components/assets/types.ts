import { RatePretty } from "@keplr-wallet/unit";

export type PoolAssetInfo = {
  coinDenom: string;
  coinImageUrl?: string;
  networkName?: string;
  poolShare?: RatePretty;
};
