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
import { EventEmitter } from "eventemitter3";
import { pollTransactionReceipt } from "./queries";

const CONNECTED_ACCOUNT_KEY = "metamask-connected-account";
const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";
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

  txStatusEventEmitter = new EventEmitter<"pending" | "confirmed" | "failed">();

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
    runInAction(() => {
      this._accountAddress = address;
      if (this.accountAddress === undefined) {
        this._chainId = undefined;
      }
    });
    this.kvStore?.set(CONNECTED_ACCOUNT_KEY, address || null);
  }

  @computed
  get chainId(): string | undefined {
    return this._chainId
      ? ChainNames[this._chainId] || this._chainId
      : undefined;
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
        if (method === "eth_sendTransaction") {
          this.txStatusEventEmitter.emit("pending");
          const txHash = resp as string;
          pollTransactionReceipt(this.send, txHash, (status) =>
            this.txStatusEventEmitter.emit(status, txHash)
          );
        }
        runInAction(() => (this._isSending = false));
        return resp;
      }) ||
      Promise.reject("Metamask: failed to send message: ethereum not in window")
    );
  });

  makeExplorerUrl = (txHash: string): string =>
    IS_TESTNET
      ? `https://ropsten.etherscan.io/tx/${txHash}`
      : `https://etherscan.io/tx/${txHash}`;
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
