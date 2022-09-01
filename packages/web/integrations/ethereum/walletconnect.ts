import {
  observable,
  computed,
  action,
  runInAction,
  makeObservable,
} from "mobx";
import { computedFn } from "mobx-utils";
import WalletConnect from "@walletconnect/client";
import { toHex, isAddress } from "web3-utils";
import { KVStore } from "@keplr-wallet/common";
import { WalletDisplay, WalletKey } from "../wallets";
import { ChainNames, EthWallet } from "./types";

const CONNECTED_ACCOUNT_KEY = "wc-eth-connected-account";
const CONNECTED_ACCOUNT_CHAINID = "wc-eth-connected-chainId";

export class ObservableWalletConnect implements EthWallet {
  key: WalletKey = "walletconnect";

  displayInfo: WalletDisplay = {
    iconUrl: "/icons/walletconnect.svg",
    displayName: "WalletConnect",
  };

  @observable
  protected _accountAddress: string | undefined;

  @observable
  protected _chainId: string | undefined;

  @observable
  protected _isSending: boolean = false;

  /** For use in a QR code or via mobile intent. Becomse `undefined` once connected. */
  @observable
  sessionConnectUri: string | undefined;

  protected _walletConnect: WalletConnect;

  constructor(protected readonly kvStore?: KVStore, bridgeUrl?: string) {
    this._walletConnect = new WalletConnect({
      bridge: bridgeUrl || "https://bridge.walletconnect.org",
      clientMeta: {
        description: "Interchain Liquidity Lab",
        icons:
          typeof window !== "undefined"
            ? [`${window.origin}/icons/OSMO.svg`]
            : [],
        name: "Osmosis",
        url: "https://osmosis.zone/",
      },
      qrcodeModal: {
        open: (uri) => runInAction(() => (this.sessionConnectUri = uri)),
        close: () => runInAction(() => (this.sessionConnectUri = undefined)),
      },
    });

    const setAccounts = (error: any, payload: any) => {
      if (error) {
        console.error("WalletConnect ERROR:", error);
        return; // TODO: handle errors
      }

      const {
        accounts: [account],
        chainId,
      } = payload.params[0];
      runInAction(() => {
        if (isAddress(account as string)) {
          this.accountAddress = account;
        } else {
          console.warn("WalletConnect WARN: address received invalid");
        }

        this.chainId = toHex(chainId as string);
      });
    };

    this._walletConnect.on("connect", setAccounts);
    this._walletConnect.on("session_update", setAccounts);
    this._walletConnect.on("disconnect", () =>
      runInAction(() => {
        this.accountAddress = undefined;
        this.chainId = undefined;
      })
    );

    // set from cache
    kvStore
      ?.get<string | null>(CONNECTED_ACCOUNT_KEY)
      .then((existingAccount) => {
        if (existingAccount) {
          this.accountAddress = existingAccount;
        }
      });
    kvStore
      ?.get<string | null>(CONNECTED_ACCOUNT_CHAINID)
      .then((existingChainId) => {
        if (existingChainId) {
          this.chainId = existingChainId;
        }
      });

    makeObservable(this);
  }

  get accountAddress(): string | undefined {
    return this._accountAddress;
  }

  protected set accountAddress(address: string | undefined) {
    runInAction(() => (this._accountAddress = address));
    this.kvStore?.set(CONNECTED_ACCOUNT_KEY, address || null);
  }

  @computed
  get chainId(): string | undefined {
    return this._chainId
      ? ChainNames[this._chainId] ?? this._chainId
      : undefined;
  }

  protected set chainId(chainId: string | undefined) {
    runInAction(() => (this._chainId = chainId));
    this.kvStore?.set(CONNECTED_ACCOUNT_CHAINID, chainId || null);
  }

  get isConnected(): boolean {
    return this.accountAddress !== undefined;
  }

  get isSending(): boolean {
    return this._isSending;
  }

  @action
  enable() {
    return new Promise<void>((resolve, reject) => {
      if (!this._walletConnect.connected) {
        this._walletConnect
          .createSession()
          .then(() => this._walletConnect.connect().then(() => resolve()))
          .catch(reject);
      } else {
        console.warn("WalletConnect: Already connected");
        resolve();
      }
    });
  }

  @action
  disable() {
    if (this._walletConnect.connected) {
      this._walletConnect.killSession().then(() => {
        this.accountAddress = undefined;
        this.chainId = undefined;
        this.sessionConnectUri = undefined;
      });
    } else {
      this.accountAddress = undefined;
      this.chainId = undefined;
      this.sessionConnectUri = undefined;
    }
  }

  send = computedFn(({ method, params: ethTx }) => {
    return withConnectedClient(
      this._walletConnect,
      this.accountAddress,
      async (conn, addr) => {
        this._isSending = true;
        const resp = await conn.sendCustomRequest({
          method,
          params: Array.isArray(ethTx) ? ethTx : [{ ...ethTx, from: addr }],
        });
        this._isSending = false;
        return resp;
      }
    );
  });

  displayError(e: any): string | undefined {
    if (e.message === "User rejected the transaction") {
      // User denied
      return "Request rejected";
    }
  }
}

function withConnectedClient(
  connector: WalletConnect,
  address: string | undefined,
  doTask: (connector: WalletConnect, address: string) => Promise<unknown>
): Promise<unknown> {
  if (!connector.connected) {
    return Promise.reject("WalletConnect client is not connected");
  }
  if (address === undefined) {
    return Promise.reject("Account not connected");
  }

  return doTask(connector, address);
}
