import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "@osmosis-labs/keplr-stores";
import {
  IPriceStore,
  ObservableQueryGauges,
  ObservableQueryIncentivizedPools,
  QueriesExternalStore as OsmosisQueriesExternalStore,
} from "@osmosis-labs/stores";
import { DeepReadonly } from "utility-types";

import {
  ObservableQueryBridgeQuotes,
  ObservableQueryBridgeTransaction,
} from "~/stores/queries-external/bridge-transfer";
import { ObservableQueryFile } from "~/stores/queries-external/github";

export class QueriesExternalStore extends OsmosisQueriesExternalStore {
  public readonly queryGitHubFile: DeepReadonly<ObservableQueryFile>;
  public readonly queryBridgeQuotes: DeepReadonly<ObservableQueryBridgeQuotes>;
  public readonly queryBridgeTransaction: DeepReadonly<ObservableQueryBridgeTransaction>;

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
    this.queryBridgeQuotes = new ObservableQueryBridgeQuotes(
      kvStore,
      priceStore
    );
    this.queryBridgeTransaction = new ObservableQueryBridgeTransaction(kvStore);
  }
}
