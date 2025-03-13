import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "@osmosis-labs/keplr-stores";

import { IPriceStore } from "../price";
import { ObservableQueryGauges } from "../queries/incentives";
import { ObservableQueryIncentivizedPools } from "../queries/pool-incentives";
import { ObservableQueryActiveGauges } from "./active-gauges";
import { ObservableQueryCirculatingSupplies } from "./circulating-supply";
import {
  ObservableQueryClPoolAvgAprs,
  ObservableQueryQuasarVaultsByPoolsId,
} from "./concentrated-liquidity";
import { ObservableQueryPriceRangeAprs } from "./concentrated-liquidity";
import {
  IMPERATOR_INDEXER_DEFAULT_BASEURL,
  IMPERATOR_TIMESERIES_DEFAULT_BASEURL,
  NUMIA_INDEXER_BASEURL,
} from "./constants";
import { ObservableQueryIbcChainsStatus } from "./ibc";
import { ObservableQueryICNSNames } from "./icns";
import { ObservableQueryMarketCaps } from "./mcap";
import { ObservableQueryPoolAprs } from "./numia";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
import { ObservableQueryPositionsPerformanceMetrics } from "./position-performance";
import { ObservableQueryTokensHistoricalChart } from "./token-historical-chart";
import { ObservableQueryMarketCap } from "./token-market-cap";
import { IQueriesExternalStore } from "./types";

/** Root store for queries external to any chain. */
export class QueriesExternalStore implements IQueriesExternalStore {
  public readonly queryAccountsPoolRewards: ObservableQueryAccountsPoolRewards;
  public readonly queryChainStatus: ObservableQueryIbcChainsStatus;
  public readonly queryMarketCaps: ObservableQueryMarketCaps;
  public readonly queryTokenHistoricalChart: ObservableQueryTokensHistoricalChart;
  public readonly queryActiveGauges: ObservableQueryActiveGauges;
  public readonly queryICNSNames: ObservableQueryICNSNames;
  public readonly queryPositionsPerformaceMetrics: ObservableQueryPositionsPerformanceMetrics;
  public readonly queryPriceRangeAprs: ObservableQueryPriceRangeAprs;
  public readonly queryClPoolAvgAprs: ObservableQueryClPoolAvgAprs;
  public readonly queryQuasarVaults: ObservableQueryQuasarVaultsByPoolsId;
  public readonly queryCirculatingSupplies: ObservableQueryCirculatingSupplies;
  public readonly queryMarketCap: ObservableQueryMarketCap;
  public readonly queryPoolAprs: ObservableQueryPoolAprs;

  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    chainGetter: ChainGetter,
    chainId: string,
    observableQueryGuage: ObservableQueryGauges,
    incentivizedPools: ObservableQueryIncentivizedPools,
    webApiBaseUrl: string,
    timeseriesDataBaseUrl = IMPERATOR_TIMESERIES_DEFAULT_BASEURL,
    indexerDataBaseUrl = IMPERATOR_INDEXER_DEFAULT_BASEURL
  ) {
    this.queryQuasarVaults = new ObservableQueryQuasarVaultsByPoolsId(kvStore);

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
    this.queryMarketCaps = new ObservableQueryMarketCaps(
      kvStore,
      timeseriesDataBaseUrl
    );
    this.queryTokenHistoricalChart = new ObservableQueryTokensHistoricalChart(
      kvStore,
      priceStore,
      timeseriesDataBaseUrl
    );
    this.queryPriceRangeAprs = new ObservableQueryPriceRangeAprs(
      kvStore,
      indexerDataBaseUrl
    );
    this.queryClPoolAvgAprs = new ObservableQueryClPoolAvgAprs(
      kvStore,
      indexerDataBaseUrl
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
        priceStore,
        indexerDataBaseUrl
      );
    this.queryCirculatingSupplies = new ObservableQueryCirculatingSupplies(
      kvStore,
      timeseriesDataBaseUrl
    );
    this.queryMarketCap = new ObservableQueryMarketCap(
      kvStore,
      timeseriesDataBaseUrl,
      priceStore
    );

    this.queryPoolAprs = new ObservableQueryPoolAprs(
      kvStore,
      NUMIA_INDEXER_BASEURL
    );
  }
}
