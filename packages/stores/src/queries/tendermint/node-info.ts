import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

import { NodeInfoResponse } from "./types";

/** Fetches all pools directly from node in order of pool creation. */
export class ObservableQueryNodeInfo extends ObservableChainQuery<NodeInfoResponse> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/cosmos/base/tendermint/v1beta1/node_info"
    );

    makeObservable(this);
  }

  /** If the node is under dev, the version string is typically `""` */
  @computed
  get isDevelopmentEnv(): boolean {
    if (!this.response) {
      return false;
    }

    return this.response?.data.application_version.version === "";
  }

  @computed
  get nodeVersion(): number | undefined {
    if (!this.response) {
      return undefined;
    }

    const majorStr =
      this.response.data.application_version.version.split(".")[0];

    const majorChars = majorStr.split("");
    const majorNums = majorChars.filter((char) => !isNaN(Number(char)));
    const version = Number(majorNums.join(""));

    return isNaN(version) ? undefined : version;
  }
}
