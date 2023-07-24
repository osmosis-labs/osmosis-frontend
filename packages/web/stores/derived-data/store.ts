import { CosmosQueries, IQueriesStore } from "@keplr-wallet/stores";
import {
  AccountStore,
  ChainStore,
  DerivedDataStore as BaseDerivedDataStore,
  IPriceStore,
  ObservableQueryActiveGauges,
  ObservableQueryPoolFeesMetrics,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { DeepReadonly } from "utility-types";

import { ObservableAssets } from "~/stores/assets";
import {
  ObservablePoolsWithMetrics,
  ObservableVerifiedPoolsStoreMap,
} from "~/stores/derived-data/pools";

/** Contains stores that compute on the lower level stores. */
export class DerivedDataStore extends BaseDerivedDataStore {
  public readonly poolsWithMetrics: DeepReadonly<ObservablePoolsWithMetrics>;
  public readonly verifiedPoolsStore: DeepReadonly<ObservableVerifiedPoolsStoreMap>;

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly accountStore: AccountStore<any>,
    protected readonly priceStore: IPriceStore,
    protected readonly chainGetter: ChainStore,
    protected readonly assetStore: ObservableAssets
  ) {
    super(
      osmosisChainId,
      queriesStore,
      externalQueries,
      accountStore,
      priceStore,
      chainGetter
    );

    this.verifiedPoolsStore = new ObservableVerifiedPoolsStoreMap(
      this.osmosisChainId,
      this.queriesStore,
      this.assetStore
    );
    this.poolsWithMetrics = new ObservablePoolsWithMetrics(
      this.osmosisChainId,
      this.queriesStore,
      this.verifiedPoolsStore,
      this.sharePoolDetails,
      this.concentratedPoolDetails,
      this.poolsBonding,
      this.chainGetter,
      this.externalQueries,
      this.priceStore
    );
  }
}
