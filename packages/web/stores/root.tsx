import {
  AccountStore,
  AccountWithCosmos,
  QueriesStore,
  QueriesWithCosmos,
} from "@keplr-wallet/stores";
import { EmbedChainInfos } from "../config";
import { IndexedDBKVStore } from "@keplr-wallet/common";
import EventEmitter from "eventemitter3";
import { ConnectWalletStore } from "./connect-wallet";
import { ChainStore } from "./chain";
import { QueriesOsmosisStore } from "@osmosis-labs/stores";

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<QueriesWithCosmos>;
  public readonly queriesOsmosisStore: QueriesOsmosisStore;

  public readonly accountStore: AccountStore<AccountWithCosmos>;
  public readonly connectWalletStore: ConnectWalletStore;

  constructor() {
    this.chainStore = new ChainStore(
      EmbedChainInfos,
      EmbedChainInfos[0].chainId
    );
    this.connectWalletStore = new ConnectWalletStore(this.chainStore);

    const eventListener = (() => {
      // On client-side (web browser), use the global window object.
      if (typeof window !== "undefined") {
        return window;
      }

      // On server-side (nodejs), there is no global window object.
      // Alternatively, use the event emitter library.
      const emitter = new EventEmitter();
      return {
        addEventListener: (type: string, fn: () => unknown) => {
          emitter.addListener(type, fn);
        },
        removeEventListener: (type: string, fn: () => unknown) => {
          emitter.removeListener(type, fn);
        },
      };
    })();

    this.queriesStore = new QueriesStore<QueriesWithCosmos>(
      new IndexedDBKVStore("store_web_queries"),
      this.chainStore,
      this.connectWalletStore.getKeplr,
      QueriesWithCosmos
    );
    this.queriesOsmosisStore = new QueriesOsmosisStore(
      (chainId: string) => this.queriesStore.get(chainId),
      new IndexedDBKVStore("store_web_queries"),
      this.chainStore
    );

    this.accountStore = new AccountStore<AccountWithCosmos>(
      eventListener,
      AccountWithCosmos,
      this.chainStore,
      this.queriesStore,
      {
        defaultOpts: {
          prefetching: false,
          suggestChain: false,
          autoInit: false,
          getKeplr: this.connectWalletStore.getKeplr,
        },
      }
    );
    this.connectWalletStore.setAccountStore(this.accountStore);
  }
}
