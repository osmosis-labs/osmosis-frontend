import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { DistrInfo } from "./types";

export class ObservableQueryDistrInfo extends ObservableChainQuery<DistrInfo> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/pool-incentives/v1beta1/distr_info`
    );

    makeObservable(this);
  }

  @computed
  get totalWeight(): Int {
    if (!this.response) {
      return new Int(0);
    }

    return new Int(this.response.data.distr_info.total_weight);
  }

  readonly getWeight = computedFn((gaugeId: string): Int => {
    if (!this.response) {
      return new Int(0);
    }

    const record = this.response.data.distr_info.records.find(
      (record) => record.gauge_id === gaugeId
    );
    if (!record) {
      return new Int(0);
    }

    return new Int(record.weight);
  });
}
