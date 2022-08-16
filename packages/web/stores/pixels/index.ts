import { ObservableQuery, ObservableQueryMap } from "@keplr-wallet/stores";
import { ResponsePermission, ResponsePixels, ResponseStatus } from "./types";
import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";

export class ObservableQueryPixels extends ObservableQuery<ResponsePixels> {
  constructor(kvStore: KVStore, baseURL: string) {
    const instance = Axios.create({
      ...{
        baseURL: baseURL,
      },
    });

    super(kvStore, instance, "/pixels/4878846");
  }
}

export class ObservableQueryStatus extends ObservableQuery<ResponseStatus> {
  constructor(kvStore: KVStore, baseURL: string) {
    const instance = Axios.create({
      ...{
        baseURL: baseURL,
      },
    });

    super(kvStore, instance, "/status");
  }
}

export class ObservableQueryPermissionInner extends ObservableQuery<ResponsePermission> {
  constructor(kvStore: KVStore, baseURL: string, bech32Address: string) {
    const instance = Axios.create({
      ...{
        baseURL: baseURL,
      },
    });

    super(kvStore, instance, `/permission/${bech32Address}`);
  }
}

export class ObservableQueryPermission extends ObservableQueryMap {
  constructor(kvStore: KVStore, baseURL: string) {
    super((bech32Address) => {
      return new ObservableQueryPermissionInner(
        kvStore,
        baseURL,
        bech32Address
      );
    });
  }

  get(bech32Address: string): ObservableQueryPermissionInner {
    return super.get(bech32Address) as ObservableQueryPermissionInner;
  }
}

export class OsmoPixelsQueries {
  public readonly queryPixels: ObservableQueryPixels;
  public readonly queryPermission: ObservableQueryPermission;
  public readonly queryStatus: ObservableQueryStatus;

  constructor(kvStore: KVStore, baseURL: string) {
    this.queryPixels = new ObservableQueryPixels(kvStore, baseURL);
    this.queryPermission = new ObservableQueryPermission(kvStore, baseURL);
    this.queryStatus = new ObservableQueryStatus(kvStore, baseURL);
  }
}
