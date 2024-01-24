import { CosmosQueries, IQueriesStore } from "@osmosis-labs/keplr-stores";
import {
  AccountStore,
  ChainStore,
  DerivedDataStore as BaseDerivedDataStore,
  IPriceStore,
  ObservableQueryActiveGauges,
  ObservableQueryClPoolAvgAprs,
  ObservableQueryPoolAprs,
  ObservableQueryPoolFeesMetrics,
  ObservableQueryPriceRangeAprs,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { DeepReadonly } from "utility-types";

import {
  ObservablePoolsWithMetrics,
  ObservableVerifiedPoolsStoreMap,
} from "~/stores/derived-data/pools";
import { UserSettings } from "~/stores/user-settings";

import { ObservableAssets } from "../assets";

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
      queryPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
      queryPriceRangeAprs: ObservableQueryPriceRangeAprs;
      queryClPoolAvgAprs: ObservableQueryClPoolAvgAprs;
      queryPoolAprs: ObservableQueryPoolAprs;
    },
    protected readonly accountStore: AccountStore<any>,
    protected readonly priceStore: IPriceStore,
    protected readonly chainGetter: ChainStore,
    protected readonly assetStore: ObservableAssets,
    protected readonly userSettings: UserSettings
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
      this.priceStore,
      this.userSettings
    );
  }
}
