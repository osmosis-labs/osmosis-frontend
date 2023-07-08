import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

export class ObservableQueryCfmmToConcentratedLiquidityPoolLink extends ObservableChainQuery<{
  concentrated_pool_id: string;
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly cfmmPoolId: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/gamm/v1beta1/concentrated_pool_id_link_from_cfmm/${cfmmPoolId}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return Boolean(this.cfmmPoolId);
  }

  /** Returns the ID of the linked concentrated liquidity pool if it exists, `false` if there's no link, or `undefined` if the request is in flight. */
  @computed
  get concentratedLiquidityPoolId() {
    // link doesn't exist
    if (this.response?.status === 400) {
      return false;
    }

    return this.response?.data.concentrated_pool_id;
  }
}

export class ObservableQueryCfmmToConcentratedLiquidityPoolLinks extends ObservableChainQueryMap<{
  concentrated_pool_id: string;
}> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (cfmmPoolId: string) => {
      return new ObservableQueryCfmmToConcentratedLiquidityPoolLink(
        kvStore,
        chainId,
        chainGetter,
        cfmmPoolId
      );
    });
  }

  get(cfmmPoolId: string): ObservableQueryCfmmToConcentratedLiquidityPoolLink {
    return super.get(
      cfmmPoolId
    ) as ObservableQueryCfmmToConcentratedLiquidityPoolLink;
  }
}
