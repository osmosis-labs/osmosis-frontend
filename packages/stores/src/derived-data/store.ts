import { CosmosQueries, IQueriesStore } from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";

import { AccountStore } from "../account";
import { ChainStore } from "../chain";
import { IPriceStore } from "../price";
import { OsmosisQueries } from "../queries";
import {
  ObservableQueryActiveGauges,
  ObservableQueryPoolFeesMetrics,
} from "../queries-external";
import {
  ObservableConcentratedPoolDetails,
  ObservablePoolsBonding,
  ObservableSharePoolDetails,
  ObservableSuperfluidPoolDetails,
} from "./pool";

/** Contains stores that compute on the lower level stores. */
export class DerivedDataStore {
  public readonly sharePoolDetails: DeepReadonly<ObservableSharePoolDetails>;
  public readonly concentratedPoolDetails: DeepReadonly<ObservableConcentratedPoolDetails>;
  public readonly superfluidPoolDetails: DeepReadonly<ObservableSuperfluidPoolDetails>;
  public readonly poolsBonding: DeepReadonly<ObservablePoolsBonding>;

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly externalQueries: {
      queryPoolFeeMetrics: ObservableQueryPoolFeesMetrics;
      queryActiveGauges: ObservableQueryActiveGauges;
    },
    protected readonly accountStore: AccountStore<any>,
    protected readonly priceStore: IPriceStore,
    protected readonly chainGetter: ChainStore
  ) {
    this.sharePoolDetails = new ObservableSharePoolDetails(
      this.osmosisChainId,
      this.queriesStore,
      this.externalQueries,
      this.accountStore,
      this.priceStore
    );
    this.concentratedPoolDetails = new ObservableConcentratedPoolDetails(
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
      this.sharePoolDetails,
      this.concentratedPoolDetails,
      this.priceStore
    );
    this.poolsBonding = new ObservablePoolsBonding(
      this.osmosisChainId,
      this.sharePoolDetails,
      this.superfluidPoolDetails,
      this.priceStore,
      this.chainGetter,
      this.externalQueries,
      this.accountStore,
      this.queriesStore
    );
  }

  getForPool(poolId: string) {
    return {
      sharePoolDetail: this.sharePoolDetails.get(poolId),
      concentratedPoolDetail: this.concentratedPoolDetails.get(poolId),
      superfluidPoolDetail: this.superfluidPoolDetails.get(poolId),
      poolBonding: this.poolsBonding.get(poolId),
    };
  }
}
