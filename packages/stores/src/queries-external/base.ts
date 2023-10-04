import { KVStore } from "@keplr-wallet/common";
import { ObservableQuery } from "@osmosis-labs/keplr-stores";
import Axios, { AxiosRequestConfig } from "axios";
export class ObservableQueryExternalBase<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, baseURL: string, urlPath: string) {
    // const instance = Axios.create({ baseURL });
    const username = "admin";
    const password = "admin";
    // test credentials
    // const username = "osmosisfe";
    // const password = "NDJLU0RybmUzazIsdflkjwerWEFn";

    console.log("username: ", username);
    console.log("password: ", password);

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
