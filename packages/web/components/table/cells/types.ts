import { BaseCell } from "..";

export interface PoolCompositionCell extends BaseCell {
  poolId: string;
  poolAssets: {
    coinImageUrl: string | undefined;
    coinDenom: string;
  }[];
}

export interface MetricLoaderCell extends BaseCell {
  isLoading: boolean;
}
