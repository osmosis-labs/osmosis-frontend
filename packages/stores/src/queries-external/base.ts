import { KVStore } from "@keplr-wallet/common";
import { ObservableQuery } from "@keplr-wallet/stores";
import Axios, { AxiosRequestConfig } from "axios";
export class ObservableQueryExternalBase<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, baseURL: string, urlPath: string) {
    const username = process.env.NEXT_PUBLIC_PROXY_API_USERNAME;
    const password = process.env.NEXT_PUBLIC_PROXY_API_PASSWORD;

    const axiosConfig: AxiosRequestConfig = {
      baseURL,
    };

    if (username && password) {
      axiosConfig.auth = {
        username,
        password,
      };
    }

    const instance = Axios.create(axiosConfig);

    super(kvStore, instance, urlPath);
  }
}
