import { QueriesStore } from "@keplr-wallet/stores";
import { AccountStore } from "@keplr-wallet/stores";
import { IndexedDBKVStore } from "@keplr-wallet/common";
import { ChainStore } from "./chain";

import { ChainInfo } from "@keplr-wallet/types";

import { EmbedChainInfos } from "../config";
import { OsmosisAccountStore } from "./osmosis/account";
import { OsmosisQueriesStore } from "./osmosis/query";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly accountStore: AccountStore;
  public readonly queriesStore: QueriesStore;

  public readonly osmosisAccountStore: OsmosisAccountStore;
  public readonly osmosisQueriesStore: OsmosisQueriesStore;

  constructor() {
    this.chainStore = new ChainStore(EmbedChainInfos, "localnet-1");

    this.queriesStore = new QueriesStore(
      new IndexedDBKVStore("store_web_queries"),
      this.chainStore
    );
    this.accountStore = new AccountStore(this.chainStore, this.queriesStore, {
      chainOpts: this.chainStore.chainInfos.map((chainInfo: ChainInfo) => {
        return {
          chainId: chainInfo.chainId,
          prefetching: true,
          suggestChain: true
        };
      })
    });

    this.osmosisAccountStore = new OsmosisAccountStore(
      this.accountStore,
      this.chainStore,
      this.queriesStore
    );

    this.osmosisQueriesStore = new OsmosisQueriesStore(
      new IndexedDBKVStore("store_web_queries"),
      this.chainStore
    );
  }
}

export function createRootStore() {
  return new RootStore();
}
