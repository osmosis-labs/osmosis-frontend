import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "@osmosis-labs/keplr-stores";
import { DeepReadonly } from "utility-types";

import { IPriceStore } from "../price";
import { ObservableQueryGauges } from "../queries/incentives";
import { ObservableQueryIncentivizedPools } from "../queries/pool-incentives";
import {
  COINGECKO_API_DEFAULT_BASEURL,
  IMPERATOR_INDEXER_DEFAULT_BASEURL as IMPERATOR_INDEXER_DATA_BASE_URL,
  IMPERATOR_TIMESERIES_DEFAULT_BASEURL as IMPERATOR_TIMESERIES_DATA_BASE_URL,
  NUMIA_INDEXER_BASEURL,
} from ".";
import { ObservableQueryActiveGauges } from "./active-gauges";
import { ObservableQueryCirculatingSupplies } from "./circulating-supply";
import { ObservableQueryCoingeckoCoinsInfos } from "./coingecko-coin-infos";
import {
  ObservableQueryClPoolAvgAprs,
  ObservableQueryQuasarVaultsByPoolsId,
} from "./concentrated-liquidity";
import { ObservableQueryPriceRangeAprs } from "./concentrated-liquidity";
import { ObservableQueryIbcChainsStatus } from "./ibc";
import { ObservableQueryICNSNames } from "./icns";
import { ObservableQueryMarketCaps } from "./mcap";
import { ObservableQueryPoolAprs } from "./numia";
import { ObservableQueryPoolFeesMetrics } from "./pool-fees";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
import { ObservableQueryPositionsPerformanceMetrics } from "./position-performance";
import { ObservableQueryTokensData } from "./token-data";
import { ObservableQueryTokensHistoricalChart } from "./token-historical-chart";
import { ObservableQueryMarketCap } from "./token-market-cap";

/** Root store for queries external to any chain. */
export class QueriesExternalStore {
  public readonly queryPoolFeeMetrics: DeepReadonly<ObservableQueryPoolFeesMetrics>;
  public readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;
  public readonly queryChainStatus: DeepReadonly<ObservableQueryIbcChainsStatus>;
  public readonly queryMarketCaps: DeepReadonly<ObservableQueryMarketCaps>;
  public readonly queryTokenHistoricalChart: DeepReadonly<ObservableQueryTokensHistoricalChart>;
  public readonly queryTokenData: DeepReadonly<ObservableQueryTokensData>;
  public readonly queryActiveGauges: DeepReadonly<ObservableQueryActiveGauges>;
  public readonly queryICNSNames: DeepReadonly<ObservableQueryICNSNames>;
  public readonly queryPositionsPerformaceMetrics: DeepReadonly<ObservableQueryPositionsPerformanceMetrics>;
  public readonly queryPriceRangeAprs: DeepReadonly<ObservableQueryPriceRangeAprs>;
  public readonly queryClPoolAvgAprs: DeepReadonly<ObservableQueryClPoolAvgAprs>;
  public readonly queryQuasarVaults: DeepReadonly<ObservableQueryQuasarVaultsByPoolsId>;
  public readonly queryCirculatingSupplies: DeepReadonly<ObservableQueryCirculatingSupplies>;
  public readonly queryCoinGeckoCoinsInfos: DeepReadonly<ObservableQueryCoingeckoCoinsInfos>;
  public readonly queryMarketCap: DeepReadonly<ObservableQueryMarketCap>;
  public readonly queryPoolAprs: DeepReadonly<ObservableQueryPoolAprs>;

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
    coinGeckoApiBaseUrl = COINGECKO_API_DEFAULT_BASEURL
  ) {
    this.queryQuasarVaults = new ObservableQueryQuasarVaultsByPoolsId(kvStore);

    this.queryPoolFeeMetrics = new ObservableQueryPoolFeesMetrics(
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
    this.queryTokenData = new ObservableQueryTokensData(
      kvStore,
      priceStore,
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
        priceStore,
        indexerDataBaseUrl
      );
    this.queryCirculatingSupplies = new ObservableQueryCirculatingSupplies(
      kvStore,
      timeseriesDataBaseUrl
    );
    this.queryCoinGeckoCoinsInfos = new ObservableQueryCoingeckoCoinsInfos(
      kvStore,
      coinGeckoApiBaseUrl
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
