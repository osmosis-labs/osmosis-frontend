import {
  CosmosQueries,
  IAccountStore,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { ObservableAssets } from "src/assets";
import { DeepReadonly } from "utility-types";

import { ChainStore } from "../chain";
import { IPriceStore } from "../price";
import { OsmosisQueries } from "../queries";
import {
  ObservableQueryActiveGauges,
  ObservableQueryPoolFeesMetrics,
} from "../queries-external";
import {
  ObservablePoolDetails,
  ObservablePoolsBonding,
  ObservableSuperfluidPoolDetails,
} from "./pool";
import {
  ObservableAssetFilteredPoolsStore,
  ObservablePoolsWithMetrics,
} from "./pools";

/** Contains stores that compute on the lower level . */
export class DerivedDataStore {
  public readonly poolDetails: DeepReadonly<ObservablePoolDetails>;
  public readonly poolsWithMetrics: DeepReadonly<ObservablePoolsWithMetrics>;
  public readonly superfluidPoolDetails: DeepReadonly<ObservableSuperfluidPoolDetails>;
  public readonly poolsBonding: DeepReadonly<ObservablePoolsBonding>;
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
    protected readonly assetStore: ObservableAssets,
    protected readonly isFrontier: boolean
  ) {
    this.poolDetails = new ObservablePoolDetails(
      this.osmosisChainId,
      this.queriesStore,
      this.externalQueries,
      this.accountStore,
      this.priceStore
    );
    this.superfluidPoolDetails = new ObservableSuperfluidPoolDetails(
      this.osmosisChainId,
      this.queriesStore,
      this.accountStore,
      this.poolDetails,
      this.priceStore
    );
    this.poolsBonding = new ObservablePoolsBonding(
      this.osmosisChainId,
      this.poolDetails,
      this.superfluidPoolDetails,
      this.priceStore,
      this.chainGetter,
      this.externalQueries,
      this.accountStore,
      this.queriesStore
    );
    this.assetFilteredPoolsStore = new ObservableAssetFilteredPoolsStore(
      this.osmosisChainId,
      this.queriesStore,
      this.assetStore,
      this.isFrontier
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

  getForPool(poolId: string) {
    return {
      poolDetail: this.poolDetails.get(poolId),
      superfluidPoolDetail: this.superfluidPoolDetails.get(poolId),
      poolBonding: this.poolsBonding.get(poolId),
    };
  }
}
