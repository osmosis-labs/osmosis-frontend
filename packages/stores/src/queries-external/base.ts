import Axios from "axios";
import { ObservableQuery } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
export class ObservableQueryExternalBase<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, baseURL: string, urlPath: string) {
    const instance = Axios.create({ baseURL });

    super(kvStore, instance, urlPath);
  }
}
