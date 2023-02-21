import { assets, chain } from "@chain-registry/osmosis";
import { Logger, WalletManager } from "@cosmos-kit/core";
import { wallets as cosmosStationWallets } from "@cosmos-kit/cosmostation";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as trustWallets } from "@cosmos-kit/trust";
import { wallets as xdefiWallets } from "@cosmos-kit/xdefi-extension";
import { action, makeObservable, observable } from "mobx";

const chains = ["osmosis"] as const;
const logger = new Logger(console, "WARN");

export class AccountStore {
  @observable
  private _refreshRequests = 0;

  private _walletManager: WalletManager = new WalletManager(
    [chain],
    [assets],
    [
      ...keplrWallets,
      ...leapWallets,
      ...cosmosStationWallets,
      ...trustWallets,
      ...xdefiWallets,
    ],
    logger,
    "icns"
  );

  constructor() {
    this.walletManager.walletRepos.forEach((repo) => {
      repo.setActions({
        viewWalletRepo: () => this.refresh(),
      });
      repo.wallets.forEach((wallet) => {
        wallet.setActions({
          data: () => this.refresh(),
          state: () => this.refresh(),
          message: () => this.refresh(),
        });
      });
    });

    makeObservable(this);

    this.walletManager.onMounted();
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
    const walletRepo = this.walletManager.getWalletRepo(chain);
    walletRepo.activate();
    return walletRepo;
  }

  getAddress(chain: typeof chains[number]) {
    const walletRepo = this.getWalletRepo(chain);
    const wallet = walletRepo.current;
    return wallet?.address;
  }
}
