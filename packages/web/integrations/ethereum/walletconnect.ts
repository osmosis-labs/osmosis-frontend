import { KVStore } from "@keplr-wallet/common";
import WalletConnect from "@walletconnect/client";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { computedFn } from "mobx-utils";
import { isAddress, numberToHex, toHex } from "web3-utils";

import { getKeyByValue } from "~/utils/object";
import { WalletDisplay, WalletKey } from "../wallets";
import { ChainNames, EthWallet } from "./types";

const CONNECTED_ACCOUNT_KEY = "wc-eth-connected-account";
const CONNECTED_ACCOUNT_CHAINID = "wc-eth-connected-chainId";

export class ObservableWalletConnect implements EthWallet {
  readonly key: WalletKey = "walletconnect";
  readonly mobileEnabled = false;

  displayInfo: WalletDisplay = {
    iconUrl: "/icons/walletconnect.svg",
    displayName: "WalletConnect",
  };

  @observable
  protected _accountAddress: string | undefined;

  @observable
  protected _chainId: string | undefined;

  @observable
  protected _isSending: string | null = null;

  /** For use in a QR code or via mobile intent. Becomse `undefined` once connected. */
  @observable
  sessionConnectUri: string | undefined;

  protected _walletConnect: WalletConnect;

  /** Eth format: `0x...` */
  @observable
  protected _preferredChainId: string | undefined;

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

  get isInstalled(): boolean {
    // we can always open a transient connection
    return true;
  }

  get isSending(): string | null {
    return this._isSending;
  }

  @action
  setPreferredSourceChain(chainName: string) {
    const ethChainId = getKeyByValue(ChainNames, chainName);

    if (ethChainId) {
      this._preferredChainId = ethChainId;
    }
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
        if (
          this._preferredChainId &&
          this._chainId !== this._preferredChainId
        ) {
          await this.switchToChain(ChainNames[this._preferredChainId]);
        }

        runInAction(() => (this._isSending = method));
        const resp = await conn.sendCustomRequest({
          method,
          params: Array.isArray(ethTx)
            ? ethTx
            : [
                {
                  from: addr,
                  ...ethTx,
                  value: ethTx.value ? toHex(ethTx.value) : undefined,
                },
              ],
        });
        runInAction(() => (this._isSending = null));
        return resp;
      }
    );
  });

  displayError(e: any): string | undefined {
    if (e.message === "User rejected the transaction") {
      // User denied
      return "requestRejected";
    }
  }

  protected switchToChain(chainName: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const hexChainId = getKeyByValue(ChainNames, chainName);
      try {
        if (!hexChainId) {
          throw new Error(`${chainName} not yet added to Axelar config`);
        }

        await this._walletConnect.sendCustomRequest({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }],
        });
        resolve();
      } catch (e: any) {
        // error about chain network not being added
        if (typeof e === "string" && e.includes("wallet_addEthereumChain")) {
          // 4902: chain not in metamask
          const ethChains: any[] = await (
            await fetch("https://chainid.network/chains.json")
          ).json();

          const chainConfig = ethChains.find(
            (chain) => numberToHex(chain.chainId) === hexChainId
          );

          if (!chainConfig) {
            throw new Error(
              `ChainList does not contain config for chain ${hexChainId}`
            );
          }

          const params = {
            chainId: numberToHex(chainConfig.chainId), // A 0x-prefixed hexadecimal string
            chainName: chainConfig.name,
            nativeCurrency: {
              name: chainConfig.nativeCurrency.name,
              symbol: chainConfig.nativeCurrency.symbol, // 2-6 characters long
              decimals: chainConfig.nativeCurrency.decimals,
            },
            rpcUrls: chainConfig.rpc,
            blockExplorerUrls: [
              chainConfig.explorers &&
              chainConfig.explorers.length > 0 &&
              chainConfig.explorers[0].url
                ? chainConfig.explorers[0].url
                : chainConfig.infoURL,
            ],
          };

          await this._walletConnect.sendCustomRequest({
            method: "wallet_addEthereumChain",
            params: [params],
          });

          // try again
          await this.switchToChain(chainName);
        } else if (e.code === -32002) {
          // -32002: Request of type 'wallet_switchEthereumChain' already pending
          reject("switchToChain: switch in progress");
        } else {
          reject(`switchToChain: unexpected error: ${e}`);
        }
      }

      reject("switchToChain: MetaMask not installed");
    });
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
