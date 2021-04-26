import { EmbedChainInfos } from "../config";
import { ChainStore } from "./chain";
import {
  AccountSetBase,
  AccountStore,
  QueriesStore
} from "@keplr-wallet/stores";
import { MemoryKVStore } from "@keplr-wallet/common";
import { autorun } from "mobx";
import { AccountWithCosmosAndOsmosis } from "./osmosis/account";
import { QueriesWithCosmosAndOsmosis } from "./osmosis/query";
import { MockKeplr } from "@keplr-wallet/provider";
import { BroadcastMode, StdTx } from "@cosmjs/launchpad";
import Axios from "axios";
import WebSocket from "ws";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly accountStore: AccountStore<AccountWithCosmosAndOsmosis>;
  public readonly queriesStore: QueriesStore<QueriesWithCosmosAndOsmosis>;

  constructor() {
    const mockKeplr = new MockKeplr(
      async (chainId: string, tx: StdTx, mode: BroadcastMode) => {
        const chainInfo = EmbedChainInfos.find(
          info => info.chainId === chainId
        );
        if (!chainInfo) {
          throw new Error("Unknown chain info");
        }

        const restInstance = Axios.create({
          ...{
            baseURL: chainInfo.rest
          }
        });

        const params = {
          tx,
          mode
        };

        const result = await restInstance.post("/txs", params);
        if (result.data.code != null && result.data.code !== 0) {
          throw new Error(result.data["raw_log"]);
        }

        return Buffer.from(result.data.txhash, "hex");
      },
      EmbedChainInfos,
      "health nest provide snow total tissue intact loyal cargo must credit wrist"
    );

    this.chainStore = new ChainStore(EmbedChainInfos, "localnet-1");

    this.queriesStore = new QueriesStore(
      new MemoryKVStore("test_store_web_queries"),
      this.chainStore,
      async () => {
        return mockKeplr;
      },
      QueriesWithCosmosAndOsmosis
    );
    this.accountStore = new AccountStore(
      {
        // No need
        addEventListener: () => {}
      },
      AccountWithCosmosAndOsmosis,
      this.chainStore,
      this.queriesStore,
      {
        defaultOpts: {
          suggestChain: false,
          prefetching: true,
          autoInit: true,
          getKeplr: async () => {
            return mockKeplr;
          },
          wsObject: WebSocket as any
        }
      }
    );
  }
}

export async function waitAccountLoaded(
  account: AccountSetBase<unknown, unknown>
) {
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
