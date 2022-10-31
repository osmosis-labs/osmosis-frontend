import Axios from "axios";
import { KVStore } from "@keplr-wallet/common";
import { ObservableQuery } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";
import { IPriceStore } from "../price";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";

/** Root store for queries external to any chain. */
export class QueriesExternalStore {
  public readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
  public readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;

  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    feeMetricsBaseURL = "https://api-osmosis.imperator.co",
    poolRewardsBaseUrl = "http://api-osmosis-chain.imperator.co"
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
  }
}

export class ObservableQueryExternalBase<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, baseURL: string, urlPath: string) {
    const instance = Axios.create({ baseURL });

    super(kvStore, instance, urlPath);
  }
}
