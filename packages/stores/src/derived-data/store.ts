import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { DeepReadonly } from "utility-types";

import { AccountStore } from "../account";
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

/** Contains stores that compute on the lower level . */
export class DerivedDataStore {
  public readonly poolDetails: DeepReadonly<ObservablePoolDetails>;
  public readonly superfluidPoolDetails: DeepReadonly<ObservableSuperfluidPoolDetails>;
  public readonly poolsBonding: DeepReadonly<ObservablePoolsBonding>;

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
    protected readonly chainGetter: ChainGetter
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
  }

  getForPool(poolId: string) {
    return {
      poolDetail: this.poolDetails.get(poolId),
      superfluidPoolDetail: this.superfluidPoolDetails.get(poolId),
      poolBonding: this.poolsBonding.get(poolId),
    };
  }
}
