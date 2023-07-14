import { KVStore } from "@keplr-wallet/common";
import { EventEmitter } from "eventemitter3";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { computedFn } from "mobx-utils";
import { t } from "react-multi-lang";
import { isAddress, toHex } from "web3-utils";

import { Alert } from "~/components/alert";
import {
  switchToChain,
  withEthInWindow,
} from "~/integrations/ethereum/metamask-utils";
import { pollTransactionReceipt } from "~/integrations/ethereum/queries";
import { ChainNames, EthWallet } from "~/integrations/ethereum/types";
import { WalletDisplay, WalletKey } from "~/integrations/wallets";
import { getKeyByValue } from "~/utils/object";

const CONNECTED_ACCOUNT_KEY = "metamask-connected-account";
const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

export class ObservableMetamask implements EthWallet {
  readonly key: WalletKey = "metamask";
  readonly mobileEnabled = false;

  readonly displayInfo: WalletDisplay = {
    iconUrl: "/icons/metamask-fox.svg",
    displayName: "MetaMask",
  };

  @observable
  protected _accountAddress: string | undefined;

  /** Eth format: `0x...` */
  @observable
  protected _chainId: string | undefined;

  @observable
  protected _isSending: string | null = null;

  /** Eth format: `0x...` */
  @observable
  protected _preferredChainId: string | undefined;

  protected _metamaskOnboarding: any | undefined;

  readonly txStatusEventEmitter = new EventEmitter<
    "pending" | "confirmed" | "failed"
  >();

  constructor(protected readonly kvStore?: KVStore) {
    makeObservable(this);

    if (
      typeof document !== "undefined" &&
      /complete|interactive|loaded/.test(document.readyState)
    ) {
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

            // switching to a few certain networks in metamask causes an undefined address to come in.
            // this causes the proxy to appear disconnected.
            // this can't be differentiated from the disconnect event, and the user must reconnect.
            if (this.accountAddress === undefined) {
              // received chainChanged from metamask, so we know the user connected prior
              this.enable();
            }
          });
        });
        eth.on("disconnect", () => handleAccountChanged([undefined]));

        // set from cache
        kvStore
          ?.get<string | null>(CONNECTED_ACCOUNT_KEY)
          .then((existingAccount) => {
            if (existingAccount) {
              this.enable();
            }
          });
      });
    }
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

  get isInstalled(): boolean {
    return (
      withEthInWindow(() => {
        return true;
      }, false) ?? false
    );
  }

  get isSending(): string | null {
    return this._isSending;
  }

  /** Chain name is a value from `ChainNames` object. */
  @action
  setPreferredSourceChain(chainName: string) {
    const ethChainId = getKeyByValue(ChainNames, chainName);

    if (ethChainId) {
      this._preferredChainId = ethChainId;
    } else {
      console.warn("Invalid chain name:", chainName, "is not in ChainNames");
    }
  }

  enable(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      withEthInWindow((ethereum) => {
        if (this.isSending) {
          return reject(`MetaMask: request in progress: ${this.isSending}`);
        }
        return ethereum
          .request({ method: "eth_requestAccounts" })
          .then((accounts) => {
            ethereum.request({ method: "eth_chainId" }).then((chainId) => {
              runInAction(() => {
                this._chainId = chainId as string;
                this.accountAddress = (accounts as string[])[0];
              });
              resolve();
            });
          })
          .catch(reject);
      });
    });
  }

  @action
  disable() {
    this.accountAddress = undefined;
    this._chainId = undefined;
  }

  readonly send = computedFn(({ method, params: ethTx }) => {
    if (!this.isConnected) {
      return Promise.reject(
        "MetaMask: can't send request, account not connected"
      );
    }
    if (this.accountAddress && !isAddress(this.accountAddress)) {
      return Promise.reject("MetaMask: invalid account address");
    }

    return (
      withEthInWindow(async (ethereum) => {
        if (
          this._preferredChainId &&
          this._chainId !== this._preferredChainId
        ) {
          try {
            await switchToChain(
              ethereum.request,
              ChainNames[this._preferredChainId]
            );
            // metamask may clear address upon switching network
            await this.enable();
          } catch (e: any) {
            if (e === "switchToChain: switch in progress") {
              return Promise.reject("MetaMask: Switch pending already");
            }

            return Promise.reject(
              `MetaMask: Failed to switch: ${
                typeof e.message === "undefined" ? e : e.message
              }`
            );
          }
        }

        runInAction(() => (this._isSending = method));
        let resp: unknown;
        try {
          resp = await ethereum.request({
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
        } catch (e: any) {
          throw e;
        } finally {
          runInAction(() => (this._isSending = null));
        }
        return resp;
      }) ||
      Promise.reject("MetaMask: failed to send message: ethereum not in window")
    );
  });

  displayError(e: any): Alert | undefined {
    if (e.code === 4001) {
      // User denied
      return {
        message: "transactionFailed",
        caption: "requestRejected",
      };
    } else if (e.code === 4100) {
      // wallet is not logged in (but is connected)
      return {
        message: "Action Unavailable",
        caption: "Please log into MetaMask",
      };
    } else if (e.code === -32002) {
      // request is there already
      return {
        message: t("assets.transfer.errors.seeRequest", {
          walletName: this.displayInfo.displayName,
        }),
      };
    }
  }

  readonly makeExplorerUrl = (txHash: string) =>
    IS_TESTNET
      ? `https://goerli.etherscan.io/tx/${txHash}`
      : `https://etherscan.io/tx/${txHash}`;

  // ONBOARDING

  /** https://docs.metamask.io/guide/onboarding-library.html#examples */
  async onboard() {
    const MetaMaskOnboarding = (await import("@metamask/onboarding")).default;

    if (MetaMaskOnboarding) {
      this._metamaskOnboarding = new MetaMaskOnboarding();
      this._metamaskOnboarding.startOnboarding();
    } else {
      console.error("MetaMask: onboarding code not available");
    }
  }

  cancelOnboarding() {
    this._metamaskOnboarding?.stopOnboarding();
  }
}
