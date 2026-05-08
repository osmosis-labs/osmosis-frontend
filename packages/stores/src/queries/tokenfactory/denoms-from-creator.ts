import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@osmosis-labs/keplr-stores";
import Axios, { AxiosInstance } from "axios";
import { computed, makeObservable, override } from "mobx";

type DenomsFromCreatorResponse = {
  denoms: string[];
};

export class ObservableQueryDenomsFromCreatorInner extends ObservableChainQuery<DenomsFromCreatorResponse> {
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
      `/api/tokenfactory/denoms-from-creator?creator=${encodeURIComponent(bech32Address)}`
    );

    makeObservable(this);
  }

  @override
  protected get instance(): AxiosInstance {
    return Axios.create({ baseURL: "" });
  }

  protected canFetch(): boolean {
    return this.bech32Address !== "";
  }

  @computed
  get denoms(): string[] {
    return this.response?.data.denoms ?? [];
  }
}

export class ObservableQueryDenomsFromCreator extends ObservableChainQueryMap<DenomsFromCreatorResponse> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryDenomsFromCreatorInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  get(bech32Address: string): ObservableQueryDenomsFromCreatorInner {
    return super.get(bech32Address) as ObservableQueryDenomsFromCreatorInner;
  }
}
