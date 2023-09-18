import { KVStore } from "@keplr-wallet/common";
import { ObservableQuery } from "@keplr-wallet/stores";
import Axios, { AxiosRequestConfig } from "axios";
export class ObservableQueryExternalBase<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, baseURL: string, urlPath: string) {
    // const username = process.env.PROXY_API_USERNAME;
    // const password = process.env.PROXY_API_PASSWORD;
    // test credentials
    const username = "osmosisfe";
    const password = "NDJLU0RybmUzazIsdflkjwerWEFn";

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization:
          "Basic b3Ntb3Npc2ZlOk5ESkxVMFJ5Ym1VemF6SXNkZmxrandlcldFRm4=",
      },
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
