import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "@osmosis-labs/keplr-stores";
import { DeepReadonly } from "utility-types";

import { IPriceStore } from "../price";
import { ObservableQueryGauges } from "../queries/incentives";
import { ObservableQueryIncentivizedPools } from "../queries/pool-incentives";
import {
  IMPERATOR_INDEXER_DEFAULT_BASEURL as IMPERATOR_INDEXER_DATA_BASE_URL,
  IMPERATOR_TIMESERIES_DEFAULT_BASEURL as IMPERATOR_TIMESERIES_DATA_BASE_URL,
  NUMIA_INDEXER_BASEURL,
} from ".";
import { ObservableQueryActiveGauges } from "./active-gauges";
import { ObservableQueryPriceRangeAprs } from "./concentrated-liquidity";
import { ObservableQueryPoolAprs } from "./numia";
import { ObservableQueryPositionsPerformanceMetrics } from "./position-performance";

/** Root store for queries external to any chain. */
export class QueriesExternalStore {
  public readonly queryActiveGauges: DeepReadonly<ObservableQueryActiveGauges>;
  public readonly queryPositionsPerformaceMetrics: DeepReadonly<ObservableQueryPositionsPerformanceMetrics>;
  public readonly queryPriceRangeAprs: DeepReadonly<ObservableQueryPriceRangeAprs>;
  public readonly queryPoolAprs: DeepReadonly<ObservableQueryPoolAprs>;

  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    chainGetter: ChainGetter,
    chainId: string,
    observableQueryGuage: ObservableQueryGauges,
    incentivizedPools: ObservableQueryIncentivizedPools,
    webApiBaseUrl: string,
    _timeseriesDataBaseUrl = IMPERATOR_TIMESERIES_DATA_BASE_URL,
    indexerDataBaseUrl = IMPERATOR_INDEXER_DATA_BASE_URL
  ) {
    this.queryPriceRangeAprs = new ObservableQueryPriceRangeAprs(
      kvStore,
      indexerDataBaseUrl
    );
    this.queryActiveGauges = new ObservableQueryActiveGauges(
      kvStore,
      webApiBaseUrl,
      observableQueryGuage,
      incentivizedPools
    );
    this.queryPositionsPerformaceMetrics =
      new ObservableQueryPositionsPerformanceMetrics(
        kvStore,
        chainGetter,
        chainId,
        priceStore,
        indexerDataBaseUrl
      );

    this.queryPoolAprs = new ObservableQueryPoolAprs(
      kvStore,
      NUMIA_INDEXER_BASEURL
    );
  }
}
