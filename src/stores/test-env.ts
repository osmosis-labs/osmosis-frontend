import { EmbedChainInfos } from "../config";
import { ChainStore } from "./chain";
import {
  AccountStore,
  AccountStoreInner,
  QueriesStore
} from "@keplr-wallet/stores";
import { MemoryKVStore } from "@keplr-wallet/common";
import { OsmosisAccountStore } from "./osmosis/account";
import { ChainInfo, Keplr, Key } from "@keplr-wallet/types";
import {
  AminoSignResponse,
  Secp256k1HdWallet,
  StdSignDoc
} from "@cosmjs/amino";
import { CosmJSOfflineSigner } from "@keplr-wallet/provider";
import { BroadcastMode, LcdClient, StdTx } from "@cosmjs/launchpad";
import { Buffer } from "buffer/";
import { autorun } from "mobx";

export class TestKeplr implements Keplr {
  readonly version: string = "";

  protected signer?: Secp256k1HdWallet;

  protected async getSigner(): Promise<Secp256k1HdWallet> {
    if (!this.signer) {
      this.signer = await Secp256k1HdWallet.fromMnemonic(this.mnemonic);
    }

    return this.signer;
  }

  constructor(
    protected readonly chainInfos: ChainInfo[],
    protected readonly mnemonic: string
  ) {}

  enable(): Promise<void> {
    // noop
    return Promise.resolve();
  }

  enigmaDecrypt(): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  enigmaEncrypt(): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  experimentalSuggestChain(): Promise<void> {
    throw new Error("Not implemented");
  }

  getEnigmaPubKey(): Promise<Uint8Array> {
    throw new Error("Not implemented");
  }

  getEnigmaUtils(): any {
    throw new Error("Not implemented");
  }

  async getKey(): Promise<Key> {
    const signer = await this.getSigner();
    const accounts = await signer.getAccounts();

    return {
      name: "",
      algo: "secp256k1",
      pubKey: accounts[0].pubkey,
      // TODO: Implement this.
      address: new Uint8Array(0),
      bech32Address: accounts[0].address
    };
  }

  getOfflineSigner(chainId: string): any {
    return new CosmJSOfflineSigner(chainId, this);
  }

  getSecret20ViewingKey(): Promise<string> {
    throw new Error("Not implemented");
  }

  async sendTx(
    chainId: string,
    stdTx: StdTx,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    const chainInfo = this.chainInfos.find(info => info.chainId === chainId);
    if (!chainInfo) {
      throw new Error("Unknown chain");
    }

    const txHash = (
      await new LcdClient(chainInfo.rest, mode).broadcastTx(stdTx)
    ).txhash;
    return Buffer.from(txHash, "hex");
  }

  async signAmino(
    _: string,
    signer: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return await (await this.getSigner()).signAmino(signer, signDoc);
  }

  signDirect(): Promise<any> {
    throw new Error("Not implemented");
  }

  suggestToken(): Promise<void> {
    throw new Error("Not implemented");
  }
}

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly accountStore: AccountStore;
  public readonly osmosisAccountStore: OsmosisAccountStore;
  public readonly queriesStore: QueriesStore;

  constructor() {
    // Force inject the Keplr API with mnemonic.
    // @ts-ignore
    window.keplr = new TestKeplr(
      EmbedChainInfos,
      "health nest provide snow total tissue intact loyal cargo must credit wrist"
    );

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
