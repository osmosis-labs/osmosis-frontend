import {
  Pools,
  SuperfluidAllAssets,
  Epochs,
  PoolFees,
  IncentivizedPools,
} from "@osmosis-labs/stores";
import { QueryResponse } from "@keplr-wallet/stores";

export interface PoolsPageSSRProps {
  pools: QueryResponse<Pools> | null;
  incentivizedPools: QueryResponse<IncentivizedPools> | null;
  poolsFeeData: QueryResponse<PoolFees> | null;
  superfluidPools: QueryResponse<SuperfluidAllAssets> | null;
  epochs: QueryResponse<Epochs> | null;
}
