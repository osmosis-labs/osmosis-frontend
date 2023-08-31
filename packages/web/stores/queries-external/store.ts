import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "@keplr-wallet/stores";
import {
  IPriceStore,
  ObservableQueryGauges,
  ObservableQueryIncentivizedPools,
  QueriesExternalStore as OsmosisQueriesExternalStore,
} from "@osmosis-labs/stores";
import { DeepReadonly } from "utility-types";

import { ObservableQueryFile } from "~/stores/queries-external/github";

export class QueriesExternalStore extends OsmosisQueriesExternalStore {
  public readonly queryGitHubFile: DeepReadonly<ObservableQueryFile>;

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

    this.queryGitHubFile = new ObservableQueryFile(kvStore);
  }
}
