import {
  runInAction,
  makeObservable,
  observable,
  action,
  computed,
} from "mobx";
import { computedFn } from "mobx-utils";
import { toHex, isAddress } from "web3-utils";
import { KVStore } from "@keplr-wallet/common";
import type { EthereumProvider } from "../../window";
import { WalletDisplay, WalletKey } from "../wallets";
import { ChainNames, EthClient } from "./types";

const CONNECTED_ACCOUNT_KEY = "metamask-connected-account";

export class ObservableMetamask implements EthClient {
  readonly key: WalletKey = "metamask";

  readonly displayInfo: WalletDisplay = {
    iconUrl: "/icons/metamask-fox.svg",
    displayName: "MetaMask",
  };

  @observable
  protected _accountAddress: string | undefined;

  @observable
  protected _chainId: string | undefined;

  @observable
  protected _isSending: boolean = false;

  constructor(protected readonly kvStore?: KVStore) {
    makeObservable(this);

    withEthInWindow((eth) => {
      const handleAccountChanged = ([account]: (string | undefined)[]) => {
        this.accountAddress = account;

        if (!account) {
          this._chainId = undefined;
        }
      };

      eth.on("accountsChanged", handleAccountChanged);
      eth.on("chainChanged", (chainId: string) => {
        runInAction(() => {
          this._chainId = chainId;
        });
      });
      eth.on("disconnect", () => handleAccountChanged([undefined]));

      // set from cache
      kvStore
        ?.get<string | null>(CONNECTED_ACCOUNT_KEY)
        .then((existingAccount) => {
          if (existingAccount) {
            this.accountAddress = existingAccount;

            // req current chain
            eth.request({ method: "eth_chainId" }).then((chainId) => {
              runInAction(() => (this._chainId = chainId as string));
            });
          }
        });
    });
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
    return this._chainId ? ChainNames[this._chainId] : undefined;
  }

  get isConnected(): boolean {
    return this.accountAddress !== undefined;
  }

  get isSending(): boolean {
    return this._isSending;
  }

  @action
  enable(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (
        typeof window === "undefined" ||
        typeof window.ethereum === "undefined" ||
        !window.ethereum.isMetaMask
      ) {
        reject("MetaMask: not installed");
      }

      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          window.ethereum.request({ method: "eth_chainId" }).then((chainId) => {
            this._chainId = chainId as string;
            this.accountAddress = (accounts as string[])[0];
            resolve();
          });
        })
        .catch(reject);
    });
  }

  @action
  disable() {
    this.accountAddress = undefined;
    this._chainId = undefined;
    withEthInWindow((eth) => eth.removeAllListeners());
  }

  send = computedFn(({ method, params: ethTx }) => {
    if (!this.accountAddress || !isAddress(this.accountAddress)) {
      return Promise.reject(
        "Metamask: can't send request, account not connected"
      );
    }

    return (
      withEthInWindow(async (ethereum) => {
        runInAction(() => (this._isSending = true));
        const resp = await ethereum.request({
          method,
          params: Array.isArray(ethTx)
            ? ethTx
            : [
                {
                  from: this.accountAddress,
                  ...ethTx,
                  value: ethTx.value ? toHex(ethTx.value) : undefined,
                },
              ],
        });
        runInAction(() => (this._isSending = false));
        return resp;
      }) ||
      Promise.reject("Metamask: failed to send message: ethereum not in window")
    );
  });
}

function withEthInWindow<T>(
  doTask: (eth: EthereumProvider) => T | undefined,
  defaultRet?: T
) {
  if (
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    window.ethereum.isMetaMask
  ) {
    return doTask(window.ethereum);
  }
  if (typeof window !== "undefined") {
    console.warn("MetaMask: no window.ethereum found");
  }
  return defaultRet;
}
