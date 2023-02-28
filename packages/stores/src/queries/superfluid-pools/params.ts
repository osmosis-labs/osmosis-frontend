import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { Dec } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";

import { SuperfluidParams } from "./types";

export class ObservableQuerySuperfluidParams extends ObservableChainQuery<SuperfluidParams> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/osmosis/superfluid/v1beta1/params");

    makeObservable(this);
  }

  @computed
  get minimumRiskFactor(): Dec {
    if (!this.response) {
      // When this value is used, it is mainly used as (1 - minimum risk factor). Therefore, 1 is the default value.
      return new Dec(1);
    }

    return new Dec(this.response.data.params.minimum_risk_factor);
  }
}
