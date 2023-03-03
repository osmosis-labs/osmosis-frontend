import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQueryMap } from "@keplr-wallet/stores";
import { ObservableCosmwasmContractChainQuery } from "@keplr-wallet/stores/build/query/cosmwasm/contract-query";
import { computed } from "mobx";

import { ICNSNames } from "./types";

export const ICNSInfo = {
  /** @see https://www.mintscan.io/osmosis/wasm/contract/osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd */
  resolverContractAddress:
    "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd",
};

export class ObservableQueryICNSNamesInner extends ObservableCosmwasmContractChainQuery<ICNSNames> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly address: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, {
      icns_names: { address: address },
    });
  }

  protected canFetch(): boolean {
    return Boolean(this.address) && this.contractAddress.length !== 0;
  }

  @computed
  get primaryName(): string {
    if (!this.response || !this.response.data) {
      return "";
    }

    return this.response.data.primary_name;
  }

  @computed
  get names(): string[] {
    if (!this.response || !this.response.data) {
      return [];
    }

    return this.response.data.names;
  }
}

export class ObservableQueryICNSNames extends ObservableChainQueryMap<ICNSNames> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const split = key.split("/");
      return new ObservableQueryICNSNamesInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        split[0],
        split[1]
      );
    });
  }

  getQueryContract(address: string): ObservableQueryICNSNamesInner {
    return this.get(
      `${ICNSInfo.resolverContractAddress}/${address}`
    ) as ObservableQueryICNSNamesInner;
  }
}
