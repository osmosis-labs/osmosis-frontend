import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { IPriceStore } from "../price";
import {
  ObservableQueryIbcDepositStatuses,
  ObservableQueryIbcWithdrawStatuses,
} from "./ibc-status";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
import {
  IMPERATOR_HISTORICAL_DATA_BASEURL,
  IMPERATOR_TX_REWARD_BASEURL,
} from ".";

/** Root store for queries external to any chain. */
export class QueriesExternalStore {
  public readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
  public readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;
  public readonly queryIbcDepositStatuses: DeepReadonly<ObservableQueryIbcDepositStatuses>;
  public readonly queryIbcWithdrawStatuses: DeepReadonly<ObservableQueryIbcWithdrawStatuses>;

  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
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
    this.queryIbcDepositStatuses = new ObservableQueryIbcDepositStatuses(
      kvStore,
      ibcStatusBaseUrl
    );
    this.queryIbcWithdrawStatuses = new ObservableQueryIbcWithdrawStatuses(
      kvStore,
      ibcStatusBaseUrl
    );
  }
}
