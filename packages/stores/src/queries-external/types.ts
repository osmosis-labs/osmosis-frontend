import { DeepReadonly } from "utility-types";

import { ObservableQueryActiveGauges } from "./active-gauges";
import { ObservableQueryCirculatingSupplies } from "./circulating-supply";
import {
  ObservableQueryClPoolAvgAprs,
  ObservableQueryQuasarVaultsByPoolsId,
} from "./concentrated-liquidity";
import { ObservableQueryPriceRangeAprs } from "./concentrated-liquidity";
import { ObservableQueryIbcChainsStatus } from "./ibc";
import { ObservableQueryICNSNames } from "./icns";
import { ObservableQueryMarketCaps } from "./mcap";
import { ObservableQueryPoolAprs } from "./numia";
import { ObservableQueryAccountsPoolRewards } from "./pool-rewards";
import { ObservableQueryPositionsPerformanceMetrics } from "./position-performance";
import { ObservableQueryTokensHistoricalChart } from "./token-historical-chart";
import { ObservableQueryMarketCap } from "./token-market-cap";

export interface IQueriesExternalStore {
  readonly queryAccountsPoolRewards: DeepReadonly<ObservableQueryAccountsPoolRewards>;
  readonly queryChainStatus: DeepReadonly<ObservableQueryIbcChainsStatus>;
  readonly queryMarketCaps: DeepReadonly<ObservableQueryMarketCaps>;
  readonly queryTokenHistoricalChart: DeepReadonly<ObservableQueryTokensHistoricalChart>;
  readonly queryActiveGauges: DeepReadonly<ObservableQueryActiveGauges>;
  readonly queryICNSNames: DeepReadonly<ObservableQueryICNSNames>;
  readonly queryPositionsPerformaceMetrics: DeepReadonly<ObservableQueryPositionsPerformanceMetrics>;
  readonly queryPriceRangeAprs: DeepReadonly<ObservableQueryPriceRangeAprs>;
  readonly queryClPoolAvgAprs: DeepReadonly<ObservableQueryClPoolAvgAprs>;
  readonly queryQuasarVaults: DeepReadonly<ObservableQueryQuasarVaultsByPoolsId>;
  readonly queryCirculatingSupplies: DeepReadonly<ObservableQueryCirculatingSupplies>;
  readonly queryMarketCap: DeepReadonly<ObservableQueryMarketCap>;
  readonly queryPoolAprs: DeepReadonly<ObservableQueryPoolAprs>;
}
