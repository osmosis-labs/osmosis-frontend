import { assets, chain } from "@chain-registry/osmosis";
import { WalletManager } from "@cosmos-kit/core";
import { wallets } from "@cosmos-kit/keplr";
import { action, makeObservable, observable } from "mobx";

const chains = ["osmosis"] as const;

export class AccountStore {
  @observable
  private _refreshRequests = 0;

  private _walletManager: WalletManager = new WalletManager(
    [chain],
    [assets],
    wallets,
    "icns"
  );

  constructor() {
    this.walletManager.setActions({
      state: () => this.refresh(),
    });
    this.walletManager.walletRepos.forEach((repo) => {
      repo.wallets.forEach((wallet) => {
        wallet.setActions({
          state: () => this.refresh(),
        });
      });
    });

    makeObservable(this);
  }

  @action
  private refresh() {
    this._refreshRequests++;
  }

  get walletManager() {
    // trigger a refresh as we don't have access to the internal methods of the wallet manager.
    this._refreshRequests;
    return this._walletManager;
  }

  getWalletRepo(chain: typeof chains[number]) {
    return this.walletManager.getWalletRepo(chain);
  }
}
