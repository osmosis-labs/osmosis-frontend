import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
} from "@osmosis-labs/keplr-stores";
import Axios, { AxiosInstance } from "axios";
import { computed, makeObservable, override } from "mobx";

export type DenomUnit = {
  denom: string;
  exponent: number;
  aliases: string[];
};

export type DenomMetadata = {
  description: string;
  denom_units: DenomUnit[];
  base: string;
  display: string;
  name: string;
  symbol: string;
  uri: string;
  uri_hash: string;
};

type DenomsMetadataResponse = {
  metadatas: DenomMetadata[];
};

/** Single shared query for all bank denom metadata. Per-denom lookups filter client-side. */
export class ObservableQueryDenomsMetadata extends ObservableChainQuery<DenomsMetadataResponse> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/api/tokenfactory/denoms-metadata`
    );

    makeObservable(this);
  }

  @override
  protected get instance(): AxiosInstance {
    return Axios.create({ baseURL: "" });
  }

  getMetadataForDenom(denom: string): DenomMetadata | undefined {
    return this.response?.data.metadatas?.find((m) => m.base === denom);
  }

  @computed
  get allMetadatas(): DenomMetadata[] {
    return this.response?.data.metadatas ?? [];
  }
}
