import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { IPriceStore } from "../price";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
/** Root store for queries external to any chain. */
export declare class QueriesExternalStore {
  readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
  readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;
  readonly queryIbcStatuses: DeepReadonly<ObservableQueryIbcStatuses>;
  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    feeMetricsBaseURL?: string,
    poolRewardsBaseUrl?: string
  );
}
