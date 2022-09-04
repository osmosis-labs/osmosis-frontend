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
import { EventEmitter } from "eventemitter3";
import { Alert } from "../../components/alert";
import { getKeyByValue } from "../../components/utils";
import { WalletDisplay, WalletKey } from "../wallets";
import { ChainNames, EthWallet } from "./types";
import { switchToChain, withEthInWindow } from "./metamask-utils";
import { pollTransactionReceipt } from "./queries";

const CONNECTED_ACCOUNT_KEY = "metamask-connected-account";
const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

export class ObservableMetamask implements EthWallet {
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

  /** Eth format: `0x...` */
  @observable
  protected _preferredChainId: string | undefined;

  readonly txStatusEventEmitter = new EventEmitter<
    "pending" | "confirmed" | "failed"
  >();

  constructor(protected readonly kvStore?: KVStore) {
    makeObservable(this);

    withEthInWindow((eth) => {
      const handleAccountChanged = ([account]: (string | undefined)[]) => {
        // switching to a few certain networks in metamask causes an undefined address to come in.
        // this causes the proxy to appear disconnected.
        // this can't be differentiated from the disconnect event, and the user must reconnect.

        this.accountAddress = account;

        if (!account) {
          runInAction(() => {
            this._chainId = undefined;
          });
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
      ? ChainNames[this._chainId] ?? this._chainId
      : undefined;
  }

  get isConnected(): boolean {
    return this.accountAddress !== undefined;
  }

  get isSending(): boolean {
    return this._isSending;
  }

  /** Chain name is a value from `ChainNames` object. */
  @action
  setPreferredSourceChain(chainName: string) {
    const ethChainId = getKeyByValue(ChainNames, chainName);

    if (ethChainId) {
      this._preferredChainId = ethChainId;
    }
  }

  @action
  enable(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (
        typeof window === "undefined" ||
        typeof window.ethereum === "undefined" ||
        !window.ethereum.isMetaMask
      ) {
        reject("MetaMask enable: not installed");
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
    if (!this.isConnected) {
      return Promise.reject(
        "Metamask: can't send request, account not connected"
      );
    }
    if (this.accountAddress && !isAddress(this.accountAddress)) {
      return Promise.reject("Metamask: invalid account address");
    }

    return (
      withEthInWindow(async (ethereum) => {
        if (
          this._preferredChainId &&
          this._chainId !== this._preferredChainId
        ) {
          await switchToChain(
            ethereum.request,
            ChainNames[this._preferredChainId]
          );
          // metamask may clear address upon switching network
          await this.enable();
        }

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

  displayError(e: any): Alert | undefined {
    if (e.code === 4001) {
      // User denied
      return {
        message: "Transaction Failed",
        caption: "Request rejected",
      };
    } else if (e.code === 4100) {
      // wallet is not logged in (but is connected)
      return {
        message: "Action Unavailable",
        caption: `Please log into MetaMask`,
      };
    }
  }

  makeExplorerUrl = (txHash: string) =>
    IS_TESTNET
      ? `https://ropsten.etherscan.io/tx/${txHash}`
      : `https://etherscan.io/tx/${txHash}`;
}
