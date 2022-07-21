import { observable, computed, action, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import WalletConnect from "@walletconnect/client";
import { toHex, isAddress } from "web3-utils";
import { WalletDisplay, WalletKey } from "../wallets";
import { ChainNames, EthClient } from "./types";

export class ObservableWalletConnect implements EthClient {
  key: WalletKey = "walletconnect";

  displayInfo: WalletDisplay = {
    iconUrl: "/icons/walletconnect.svg",
    displayName: "WalletConnect",
    caption: "Ethereum via WalletConnect",
  };

  @observable
  accountAddress: string | undefined;

  @observable
  protected _chainId: string | undefined;

  @observable
  protected _isSending: boolean = false;

  /** For use in a QR code or via mobile intent. */
  @observable
  sessionConnectUri: string | undefined;

  protected _walletConnect: WalletConnect;

  constructor(bridgeUrl?: string) {
    this._walletConnect = new WalletConnect({
      bridge: bridgeUrl || "https://bridge.walletconnect.org",
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

        this._chainId = toHex(chainId as string);
      });
    };

    this._walletConnect.on("connect", setAccounts);
    this._walletConnect.on("session_update", setAccounts);
    this._walletConnect.on("disconnect", () =>
      runInAction(() => {
        this.accountAddress = undefined;
        this._chainId = undefined;
      })
    );
  }

  @computed
  get chainId(): string | undefined {
    return this._chainId ? ChainNames[this._chainId] : undefined;
  }

  @computed
  get isConnected(): boolean {
    return this.accountAddress !== undefined && this._chainId !== undefined;
  }

  @computed
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
    withConnectedClient(
      this._walletConnect,
      this.accountAddress,
      async (conn) => {
        conn.killSession().then(() => {
          this.accountAddress = undefined;
          this._chainId = undefined;
        });
      }
    );
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
