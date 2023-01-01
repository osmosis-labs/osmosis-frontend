import { DeepReadonly } from "utility-types";
import {
  IAccountStore,
  IQueriesStore,
  CosmosQueries,
  ChainGetter,
} from "@keplr-wallet/stores";
import { OsmosisQueries } from "../queries";
import { IPriceStore } from "../price";
import {
  ObservableQueryPoolFeesMetrics,
  ObservableQueryActiveGauges,
} from "../queries-external";
import {
  ObservablePoolDetails,
  ObservableSuperfluidPoolDetails,
  ObservablePoolsBonding,
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
    protected readonly accountStore: IAccountStore,
    protected readonly priceStore: IPriceStore,
    protected readonly chainGetter: ChainGetter
  ) {
    this.poolDetails = new ObservablePoolDetails(
      this.osmosisChainId,
      this.queriesStore,
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
