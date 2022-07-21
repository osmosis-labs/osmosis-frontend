import { observable, computed, action, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { toHex, isAddress } from "web3-utils";
import type { EthereumProvider } from "../../window";
import { WalletDisplay, WalletKey } from "../wallets";
import { ChainNames, EthClient } from "./types";

export class ObservableMetamask implements EthClient {
  key: WalletKey = "metamask";

  displayInfo: WalletDisplay = {
    iconUrl: "/icons/metamask-fox.svg",
    displayName: "Metamask",
    caption: "Metamask browser extension",
  };

  @observable
  accountAddress: string | undefined;

  @observable
  protected _chainId: string | undefined;

  @observable
  protected _isSending: boolean = false;

  constructor() {
    withEthInWindow((eth) => {
      const handleAccountChanged = ([account]: (string | undefined)[]) => {
        runInAction(() => {
          this.accountAddress = account;
        });
      };

      eth.on("accountsChanged", handleAccountChanged);
      eth.on("chainChanged", (chainId: string) => {
        runInAction(() => {
          this._chainId = chainId;
        });
      });
      eth.on("disconnect", () => handleAccountChanged([undefined]));
    });
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
        this._isSending = true;
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
        this._isSending = false;
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
  return defaultRet;
}
