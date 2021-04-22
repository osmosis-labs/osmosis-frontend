import { EmbedChainInfos } from "../config";
import { ChainStore } from "./chain";
import {
  AccountStore,
  AccountStoreInner,
  QueriesStore
} from "@keplr-wallet/stores";
import { MemoryKVStore } from "@keplr-wallet/common";
import { OsmosisAccountStore } from "./osmosis/account";
import { autorun } from "mobx";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly accountStore: AccountStore;
  public readonly osmosisAccountStore: OsmosisAccountStore;
  public readonly queriesStore: QueriesStore;

  constructor() {
    this.chainStore = new ChainStore(EmbedChainInfos, "localnet-1");

    this.queriesStore = new QueriesStore(
      new MemoryKVStore("test_store_web_queries"),
      this.chainStore
    );
    this.accountStore = new AccountStore(this.chainStore, this.queriesStore);
    this.osmosisAccountStore = new OsmosisAccountStore(
      this.accountStore,
      this.chainStore,
      this.queriesStore
    );
  }
}

export async function waitAccountLoaded(account: AccountStoreInner) {
  if (account.isReadyToSendMsgs) {
    return;
  }

  return new Promise<void>(resolve => {
    const disposer = autorun(() => {
      if (account.isReadyToSendMsgs) {
        resolve();
        disposer();
      }
    });
  });
}

export function createTestStore() {
  return new RootStore();
}
