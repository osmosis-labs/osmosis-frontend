import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { Dec } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";

import { SuperfluidAssetMultiplier } from "./types";

export class ObservableQuerySuperfluidAssetMultiplierInner extends ObservableChainQuery<SuperfluidAssetMultiplier> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly denom: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/superfluid/v1beta1/asset_multiplier?denom=${denom}`
    );

    makeObservable(this);
  }

  @computed
  get multiplier(): Dec {
    if (!this.response) {
      return new Dec(0);
    }

    return new Dec(this.response.data.osmo_equivalent_multiplier.multiplier);
  }
}

export class ObservableQuerySuperfluidAssetMultiplier extends ObservableChainQueryMap<SuperfluidAssetMultiplier> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (denom) => {
      return new ObservableQuerySuperfluidAssetMultiplierInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        denom
      );
    });
  }

  getDenom(denom: string): ObservableQuerySuperfluidAssetMultiplierInner {
    return this.get(denom) as ObservableQuerySuperfluidAssetMultiplierInner;
  }
}
