import {
  Pools,
  SuperfluidAllAssets,
  Epochs,
  PoolFees,
} from "@osmosis-labs/stores";
import { QueryResponse } from "@keplr-wallet/stores";

export interface PoolsPageSSRProps {
  pools?: QueryResponse<Pools>;
  poolsFeeData?: QueryResponse<PoolFees>;
  superfluidPools?: QueryResponse<SuperfluidAllAssets>;
  epochs?: QueryResponse<Epochs>;
}
