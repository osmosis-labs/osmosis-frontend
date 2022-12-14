import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { IPriceStore } from "../price";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
import { ObservableQueryIbcChainsStatus } from "./ibc";
import {
  IMPERATOR_HISTORICAL_DATA_BASEURL,
  IMPERATOR_TX_REWARD_BASEURL,
} from ".";

/** Root store for queries external to any chain. */
export class QueriesExternalStore {
  public readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
  public readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;
  public readonly queryChainStatus: DeepReadonly<ObservableQueryIbcChainsStatus>;

  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    chainId: string,
    feeMetricsBaseURL = IMPERATOR_HISTORICAL_DATA_BASEURL,
    poolRewardsBaseUrl = IMPERATOR_TX_REWARD_BASEURL
  ) {
    this.queryGammPoolFeeMetrics = new ObservableQueryPoolFeesMetrics(
      kvStore,
      feeMetricsBaseURL
    );
    this.queryAccountsPoolRewards = new ObservableQueryAccountsPoolRewards(
      kvStore,
      priceStore,
      poolRewardsBaseUrl
    );
    this.queryChainStatus = new ObservableQueryIbcChainsStatus(
      kvStore,
      chainId,
      feeMetricsBaseURL
    );
  }
}
