import { assets, chain } from "@chain-registry/osmosis";
import { Logger, WalletManager } from "@cosmos-kit/core";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { action, makeObservable, observable } from "mobx";

const chains = ["osmosis"] as const;
const logger = new Logger(console, "WARN");

export class AccountStore {
  @observable
  private _refreshRequests = 0;

  private _walletManager: WalletManager = new WalletManager(
    [chain],
    [assets],
    [...keplrWallets, ...leapWallets],
    logger,
    "icns"
  );

  constructor() {
    this.walletManager.walletRepos.forEach((repo) => {
      repo.wallets.forEach((wallet) => {
        wallet.setActions({
          state: () => this.refresh(),
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
