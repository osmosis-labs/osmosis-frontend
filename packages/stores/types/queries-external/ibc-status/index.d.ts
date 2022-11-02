import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "../base";
import { IbcStatus } from "./types";

export declare class ObservableQueryIbcStatuses extends ObservableQueryExternalBase<IbcStatus> {
  constructor(kvStore: KVStore, baseURL: string, _counterPartyChainID: string);
  protected canFetch(): boolean;
  readonly getIbcStatus: (counterPartyChainID: string) => string;
}

export declare class ObservableQueryIbcStatuses extends HasMapStore<ObservableQueryIbcStatus> {
  constructor(kvStore: KVStore, ibcStatusBaseUrl: string);
  get(counterPartyChainID: string): ObservableQueryIbcStatus;
}
export * from "./types";
