import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

type QueryUserValidatorPreferencesResponse = {
  preferences: {
    val_oper_address: string;
    weight: string;
  }[];
};

export class ObservableQueryUserValidatorPreferences extends ObservableChainQuery<QueryUserValidatorPreferencesResponse> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/valset-pref/v1beta1/${bech32Address}`
    );

    makeObservable(this);
  }

  protected canFetch() {
    return Boolean(this.bech32Address);
  }

  @computed
  get hasValidatorPreferences() {
    return Boolean(this.response) && !Boolean(this.error);
  }

  @computed
  get validatorPreferences() {
    if (!this.response || this.error) return [];

    return this.response.data.preferences;
  }
}

export class ObservableQueryUsersValidatorPreferences extends ObservableChainQueryMap<QueryUserValidatorPreferencesResponse> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryUserValidatorPreferences(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  get(bech32Address: string) {
    return super.get(bech32Address) as ObservableQueryUserValidatorPreferences;
  }
}
