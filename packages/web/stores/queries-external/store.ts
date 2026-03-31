import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "@osmosis-labs/keplr-stores";
import {
  IPriceStore,
  ObservableQueryGauges,
  ObservableQueryIncentivizedPools,
  QueriesExternalStore as OsmosisQueriesExternalStore,
} from "@osmosis-labs/stores";

export class QueriesExternalStore extends OsmosisQueriesExternalStore {
  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    chainGetter: ChainGetter,
    chainId: string,
    observableQueryGuage: ObservableQueryGauges,
    incentivizedPools: ObservableQueryIncentivizedPools,
    webApiBaseUrl: string,
    timeseriesDataBaseUrl?: string,
    indexerDataBaseUrl?: string
  ) {
    super(
      kvStore,
      priceStore,
      chainGetter,
      chainId,
      observableQueryGuage,
      incentivizedPools,
      webApiBaseUrl,
      timeseriesDataBaseUrl,
      indexerDataBaseUrl
    );
  }
}
