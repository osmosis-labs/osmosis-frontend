import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

export class ObservableQueryConcentratedLiquidityToCfmmPoolLink extends ObservableChainQuery<{
  cfmm_pool_id: string;
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly clPoolId: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/concentratedliquidity/v1beta1/cfmm_pool_id_link_from_concentrated/${clPoolId}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return Boolean(this.clPoolId);
  }

  /** Returns the ID of the linked concentrated liquidity pool if it exists, `false` if there's no link, or `undefined` if the request is in flight. */
  @computed
  get cfmmPoolId() {
    // link doesn't exist
    if (this.response?.status === 400) {
      return false;
    }

    return this.response?.data.cfmm_pool_id;
  }
}

export class ObservableQueryConcentratedLiquidityToCfmmPoolLinks extends ObservableChainQueryMap<{
  cfmm_pool_id: string;
}> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (clPoolId: string) => {
      return new ObservableQueryConcentratedLiquidityToCfmmPoolLink(
        kvStore,
        chainId,
        chainGetter,
        clPoolId
      );
    });
  }

  get(clPoolId: string): ObservableQueryConcentratedLiquidityToCfmmPoolLink {
    return super.get(
      clPoolId
    ) as ObservableQueryConcentratedLiquidityToCfmmPoolLink;
  }
}
