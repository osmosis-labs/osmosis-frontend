import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@osmosis-labs/keplr-stores";
import Axios, { AxiosInstance } from "axios";
import { computed, makeObservable, override } from "mobx";

type DenomAuthorityMetadataResponse = {
  authority_metadata: {
    admin: string;
  };
};

export class ObservableQueryDenomAuthorityMetadataInner extends ObservableChainQuery<DenomAuthorityMetadataResponse> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    readonly denom: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/api/tokenfactory/authority-metadata?denom=${encodeURIComponent(denom)}`
    );
    makeObservable(this);
  }

  @override
  protected get instance(): AxiosInstance {
    return Axios.create({ baseURL: "" });
  }

  protected canFetch(): boolean {
    return this.denom !== "" && this.denom.startsWith("factory/");
  }

  @computed
  get admin(): string {
    return this.response?.data.authority_metadata?.admin ?? "";
  }

  @computed
  get loaded(): boolean {
    return this.response !== undefined;
  }
}

export class ObservableQueryDenomAuthorityMetadata extends ObservableChainQueryMap<DenomAuthorityMetadataResponse> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (denom: string) => {
      return new ObservableQueryDenomAuthorityMetadataInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        denom
      );
    });
  }

  get(denom: string): ObservableQueryDenomAuthorityMetadataInner {
    return super.get(denom) as ObservableQueryDenomAuthorityMetadataInner;
  }
}
