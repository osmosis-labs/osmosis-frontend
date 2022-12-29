import { KVStore } from "@keplr-wallet/common";
import { DeepReadonly } from "utility-types";
import { IPriceStore } from "../price";
import { ObservableQueryGauge } from "../queries/incentives";
import { ObservableQueryActiveGauges } from "./active-gauges";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
import { ObservableQueryIbcChainsStatus } from "./ibc";
import {
  IMPERATOR_HISTORICAL_DATA_BASEURL,
  IMPERATOR_TX_REWARD_BASEURL,
} from ".";
import { ObservableQueryTokensHistoricalChart } from "./token-historical-chart";
import { ObservableQueryTokensData } from "./token-data";

/** Root store for queries external to any chain. */
export class QueriesExternalStore {
  public readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
  public readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;
  public readonly queryChainStatus: DeepReadonly<ObservableQueryIbcChainsStatus>;
  public readonly queryTokenHistoricalChart: DeepReadonly<ObservableQueryTokensHistoricalChart>;
  public readonly queryTokenData: DeepReadonly<ObservableQueryTokensData>;
  public readonly queryActiveGauges: DeepReadonly<ObservableQueryActiveGauges>;

  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    chainId: string,
    observableQueryGuage: ObservableQueryGauge,
    webApiBaseUrl: string,
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
    this.queryTokenHistoricalChart = new ObservableQueryTokensHistoricalChart(
      kvStore,
      priceStore,
      feeMetricsBaseURL
    );
    this.queryTokenData = new ObservableQueryTokensData(
      kvStore,
      feeMetricsBaseURL
    );
    this.queryActiveGauges = new ObservableQueryActiveGauges(
      kvStore,
      webApiBaseUrl,
      observableQueryGuage
    );
  }
}
