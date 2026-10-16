import type { ObservableQuery } from "@osmosis-labs/keplr-stores";
import type { PoolGetter } from "@osmosis-labs/types";

import type { ObservableQueryPool } from "./pool";

export interface ObservableQueryPoolGetter
  extends PoolGetter<ObservableQueryPool>, ObservableQuery {
  paginate(): Promise<void>;
  fetchRemainingPools(params?: {
    limit?: number;
    minLiquidity?: number;
  }): Promise<void>;
}

export {
  ALLOYED_POOL_CODE_IDS_MAINNET,
  PoolGetter,
  PoolRaw,
  Pools,
  PoolType,
} from "@osmosis-labs/types";
