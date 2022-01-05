import { action, makeObservable, observable } from "mobx";
import { Keplr } from "@keplr-wallet/types";
import WalletConnect from "@walletconnect/client";
import {
  AccountStore,
  AccountWithCosmos,
  getKeplrFromWindow,
  WalletStatus,
} from "@keplr-wallet/stores";
import { ChainStore } from "./chain";

export type WalletType = "true" | "extension" | "wallet-connect" | null;
export const KeyConnectingWalletType = "connecting_wallet_type";
export const KeyAutoConnectingWalletType = "account_auto_connect";

export class ConnectWalletStore {
  // We should set the wallet connector when the `getKeplr()` method should return the `Keplr` for wallet connect.
  // But, account store request the `getKeplr()` method whenever that needs the `Keplr` api.
  // Thus, we should return the `Keplr` api persistently if the wallet connect is connected.
  // And, when the wallet is disconnected, we should clear this field.
  // In fact, `WalletConnect` itself is persistent.
  // But, in some cases, it acts inproperly.
  // So, handle that in the store logic too.
  protected walletConnector: WalletConnect | undefined;

  @observable
  autoConnectingWalletType: WalletType;

  constructor(
    protected readonly chainStore: ChainStore,
    protected accountStore?: AccountStore<AccountWithCosmos>
  ) {
    if (typeof window !== "undefined") {
      this.autoConnectingWalletType = localStorage?.getItem(
        KeyAutoConnectingWalletType
      ) as WalletType;
    }
    makeObservable(this);
  }

  // The account store needs to reference the `getKeplr()` method this on the constructor.
  // But, this store also needs to reference the account store.
  // To solve this problem, just set the account store field lazily.
  setAccountStore(accountStore: AccountStore<AccountWithCosmos>) {
    this.accountStore = accountStore;
  }

  getKeplr = (): Promise<Keplr | undefined> => {
    if (typeof window === "undefined") {
      return new Promise((resolve) => resolve(undefined));
    }

    return getKeplrFromWindow();
  };

  onWalletConnectDisconnected = (error: Error | null) => {
    if (error) {
      console.log(error);
    } else {
      this.disableAutoConnect();
      this.disconnect();
    }
  };

  /**
   * Disconnect the wallet regardless of wallet type (extension, wallet connect)
   */
  disconnect() {
    if (this.walletConnector) {
      if (this.walletConnector.connected) {
        this.walletConnector.killSession();
      }
      this.walletConnector = undefined;
    }

    if (this.accountStore) {
      for (const chainInfo of this.chainStore.chainInfos) {
        const account = this.accountStore.getAccount(chainInfo.chainId);
        // Clear all account.
        if (account.walletStatus !== WalletStatus.NotInit) {
          account.disconnect();
        }
      }
    }
  }

  @action
  disableAutoConnect() {
    if (typeof window === "undefined") {
      return null;
    }

    localStorage?.removeItem(KeyAutoConnectingWalletType);
    this.autoConnectingWalletType = null;
  }
}
