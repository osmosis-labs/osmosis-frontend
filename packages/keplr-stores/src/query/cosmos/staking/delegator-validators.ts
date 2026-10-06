import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Validator, Validators } from "./types";
import { KVStore } from "../../../common/kv-store";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";

/**
 * Every validator a delegator has a delegation with, whatever its bond status.
 * Lets callers see a delegation's validator even after it leaves the active
 * set, without fetching the full (mostly unbonded) validator list.
 */
export class ObservableQueryDelegatorValidatorsInner extends ObservableChainQuery<Validators> {
  protected bech32Address: string;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/staking/v1beta1/delegators/${bech32Address}/validators?pagination.limit=1000`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  @computed
  get validators(): Validator[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.validators;
  }
}

export class ObservableQueryDelegatorValidators extends ObservableChainQueryMap<Validators> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryDelegatorValidatorsInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableQueryDelegatorValidatorsInner {
    return this.get(bech32Address) as ObservableQueryDelegatorValidatorsInner;
  }
}
