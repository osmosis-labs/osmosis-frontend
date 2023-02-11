import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";

import { IPriceStore } from "../price";
import { ObservableQueryGauges } from "../queries/incentives";
import {
  IMPERATOR_HISTORICAL_DATA_BASEURL,
  IMPERATOR_TX_REWARD_BASEURL,
} from ".";
import { ObservableQueryActiveGauges } from "./active-gauges";
import { ObservableQueryIbcChainsStatus } from "./ibc";
import { ObservableQueryICNSNames } from "./icns";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
import { ObservableQueryTokensData } from "./token-data";
import { ObservableQueryTokensHistoricalChart } from "./token-historical-chart";

/** Root store for queries external to any chain. */
export class QueriesExternalStore {
  public readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
  public readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;
  public readonly queryChainStatus: DeepReadonly<ObservableQueryIbcChainsStatus>;
  public readonly queryTokenHistoricalChart: DeepReadonly<ObservableQueryTokensHistoricalChart>;
  public readonly queryTokenData: DeepReadonly<ObservableQueryTokensData>;
  public readonly queryActiveGauges: DeepReadonly<ObservableQueryActiveGauges>;
  public readonly queryICNSNames: DeepReadonly<ObservableQueryICNSNames>;

  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    chainGetter: ChainGetter,
    chainId: string,
    observableQueryGuage: ObservableQueryGauges,
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
    this.queryICNSNames = new ObservableQueryICNSNames(
      kvStore,
      chainId,
      chainGetter
    );
  }
}
