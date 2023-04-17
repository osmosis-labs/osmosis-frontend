import {
  CosmosQueries,
  IAccountStore,
  IQueriesStore,
} from "@keplr-wallet/stores";
import {
  ChainStore,
  DerivedDataStore as BaseDerivedDataStore,
  IPriceStore,
  ObservableQueryActiveGauges,
  ObservableQueryPoolFeesMetrics,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { DeepReadonly } from "utility-types";

import { ObservableAssets } from "../assets";
import {
  ObservableAssetFilteredPoolsStore,
  ObservablePoolsWithMetrics,
} from "./pools";

/** Contains stores that compute on the lower level stores. */
export class DerivedDataStore extends BaseDerivedDataStore {
  public readonly poolsWithMetrics: DeepReadonly<ObservablePoolsWithMetrics>;
  public readonly assetFilteredPoolsStore: DeepReadonly<ObservableAssetFilteredPoolsStore>;

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly externalQueries: {
      queryGammPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly accountStore: IAccountStore,
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

    this.assetFilteredPoolsStore = new ObservableAssetFilteredPoolsStore(
      this.osmosisChainId,
      this.queriesStore,
      this.assetStore
    );
    this.poolsWithMetrics = new ObservablePoolsWithMetrics(
      this.osmosisChainId,
      this.assetFilteredPoolsStore,
      this.poolDetails,
      this.poolsBonding,
      this.chainGetter,
      this.externalQueries,
      this.priceStore
    );
  }
}
