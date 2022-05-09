import { Pools, SuperfluidAllAssets, Epochs } from "@osmosis-labs/stores";
import { QueryResponse } from "@keplr-wallet/stores";

export interface PoolsPageSSRProps {
  pools?: QueryResponse<Pools>;
  superfluidPools?: QueryResponse<SuperfluidAllAssets>;
  epochs?: QueryResponse<Epochs>;
}
