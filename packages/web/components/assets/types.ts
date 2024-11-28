import { RatePretty } from "@osmosis-labs/unit";

export type PoolAssetInfo = {
  coinDenom: string;
  coinImageUrl?: string;
  networkName?: string;
  poolShare?: RatePretty;
};
