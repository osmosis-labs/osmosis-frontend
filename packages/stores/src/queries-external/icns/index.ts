import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQueryMap } from "@keplr-wallet/stores";
import { ObservableCosmwasmContractChainQuery } from "@keplr-wallet/stores/build/query/cosmwasm/contract-query";
import { computed } from "mobx";
import { ICNS_RESOLVER_CONTRACT_ADDRESS } from "..";
import { ICNSNames } from "./types";

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
      console.log(chainId, chainGetter.getChain(chainId));
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
      `${ICNS_RESOLVER_CONTRACT_ADDRESS}/${address}`
    ) as ObservableQueryICNSNamesInner;
  }
}
