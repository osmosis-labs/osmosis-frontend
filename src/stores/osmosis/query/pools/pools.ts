import { ObservableChainQuery } from "@keplr-wallet/stores/build/query/chain-query";
import { Pools } from "./types";
import { ChainGetter } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";

export class ObservableQueryPools extends ObservableChainQuery<Pools> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/osmosis/gamm/v1beta1/pools/all");
  }
}
