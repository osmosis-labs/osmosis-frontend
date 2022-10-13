import { WeightedPoolRaw } from "@osmosis-labs/pools";

export type Pools = {
  pools: WeightedPoolRaw[];
};

export type NumPools = {
  num_pools: string;
};
