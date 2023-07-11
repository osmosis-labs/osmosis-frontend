import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";

import { IPriceStore } from "../price";
import { ObservableQueryGauges } from "../queries/incentives";
import { ObservableQueryIncentivizedPools } from "../queries/pool-incentives";
import {
  IMPERATOR_INDEXER_DEFAULT_BASEURL as IMPERATOR_INDEXER_DATA_BASE_URL,
  IMPERATOR_TIMESERIES_DEFAULT_BASEURL as IMPERATOR_TIMESERIES_DATA_BASE_URL,
} from ".";
import { ObservableQueryActiveGauges } from "./active-gauges";
import { ObservableQueryPositionsRangeApr } from "./concentrated-liquidity";
import { ObservableQueryIbcChainsStatus } from "./ibc";
import { ObservableQueryICNSNames } from "./icns";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
import { ObservableQueryPositionsPerformanceMetrics } from "./position-performance";
import { ObservableQueryTokensData } from "./token-data";
import { ObservableQueryTokensHistoricalChart } from "./token-historical-chart";
import { ObservableQueryTokensPairHistoricalChart } from "./token-pair-historical-chart";

/** Root store for queries external to any chain. */
export class QueriesExternalStore {
  public readonly queryGammPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
  public readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;
  public readonly queryChainStatus: DeepReadonly<ObservableQueryIbcChainsStatus>;
  public readonly queryTokenHistoricalChart: DeepReadonly<ObservableQueryTokensHistoricalChart>;
  public readonly queryTokenPairHistoricalChart: DeepReadonly<ObservableQueryTokensPairHistoricalChart>;
  public readonly queryPositionsRangeApr: DeepReadonly<ObservableQueryPositionsRangeApr>;
  public readonly queryTokenData: DeepReadonly<ObservableQueryTokensData>;
  public readonly queryActiveGauges: DeepReadonly<ObservableQueryActiveGauges>;
  public readonly queryICNSNames: DeepReadonly<ObservableQueryICNSNames>;
  public readonly queryPositionsPerformaceMetrics: DeepReadonly<ObservableQueryPositionsPerformanceMetrics>;

  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    chainGetter: ChainGetter,
    chainId: string,
    observableQueryGuage: ObservableQueryGauges,
    incentivizedPools: ObservableQueryIncentivizedPools,
    webApiBaseUrl: string,
    timeseriesDataBaseUrl = IMPERATOR_TIMESERIES_DATA_BASE_URL,
    indexerDataBaseUrl = IMPERATOR_INDEXER_DATA_BASE_URL,
    isTestnet = false
  ) {
    this.queryGammPoolFeeMetrics = new ObservableQueryPoolFeesMetrics(
      kvStore,
      timeseriesDataBaseUrl
    );
    this.queryAccountsPoolRewards = new ObservableQueryAccountsPoolRewards(
      kvStore,
      priceStore,
      indexerDataBaseUrl
    );
    this.queryChainStatus = new ObservableQueryIbcChainsStatus(
      kvStore,
      chainId,
      timeseriesDataBaseUrl
    );
    this.queryTokenHistoricalChart = new ObservableQueryTokensHistoricalChart(
      kvStore,
      priceStore,
      timeseriesDataBaseUrl
    );
    this.queryTokenPairHistoricalChart =
      new ObservableQueryTokensPairHistoricalChart(
        kvStore,
        priceStore,
        timeseriesDataBaseUrl,
        isTestnet
      );
    this.queryPositionsRangeApr = new ObservableQueryPositionsRangeApr(
      kvStore,
      indexerDataBaseUrl
    );
    this.queryTokenData = new ObservableQueryTokensData(
      kvStore,
      timeseriesDataBaseUrl
    );
    this.queryActiveGauges = new ObservableQueryActiveGauges(
      kvStore,
      webApiBaseUrl,
      observableQueryGuage,
      incentivizedPools
    );
    this.queryICNSNames = new ObservableQueryICNSNames(
      kvStore,
      chainId,
      chainGetter
    );

    this.queryPositionsPerformaceMetrics =
      new ObservableQueryPositionsPerformanceMetrics(
        kvStore,
        chainGetter,
        chainId,
        indexerDataBaseUrl
      );
  }
}
