import { RatePretty } from "@osmosis-labs/unit";

export type PoolAssetInfo = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinImageUrl?: string;
  networkName?: string;
  poolShare?: RatePretty;
};
