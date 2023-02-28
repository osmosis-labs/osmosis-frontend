import { assets, chain } from "@chain-registry/osmosis";
import { Logger, WalletManager } from "@cosmos-kit/core";
import { wallets as cosmosStationWallets } from "@cosmos-kit/cosmostation";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as trustWallets } from "@cosmos-kit/trust";
import { wallets as xdefiWallets } from "@cosmos-kit/xdefi-extension";
import { action, makeObservable, observable } from "mobx";

const logger = new Logger("WARN");

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
    "icns",
    {
      signClient: {
        projectId: "a8510432ebb71e6948cfd6cde54b70f7", // TODO: replace with our own
        relayUrl: "wss://relay.walletconnect.org",
      },
    }
  );

  constructor() {
    this.walletManager.setActions({
      viewWalletRepo: () => this.refresh(),
      data: () => this.refresh(),
      state: () => this.refresh(),
      message: () => this.refresh(),
    });
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

    if (typeof window !== "undefined") {
      this.walletManager.onMounted();
    }
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

  /**
   * Get wallet repository for a given chain name or chain id.
   *
   * @param chainName - Chain name or chain id
   * @returns Wallet repository
   */
  getWalletRepo(chainName: string) {
    const walletRepo = this.walletManager.walletRepos.find(
      (repo) =>
        repo.chainName === chainName ||
        repo.chainRecord.chain.chain_id === chainName
    );

    if (!walletRepo) {
      throw new Error(`Chain ${chainName} is not provided.`);
    }

    walletRepo.activate();
    return walletRepo;
  }

  /**
   * Get the current wallet for the given chain name
   * @param chainName - Chain name
   * @returns ChainWalletBase
   */
  getWallet(chainName: string) {
    const walletRepo = this.getWalletRepo(chainName);
    const wallet = walletRepo.current;
    return wallet;
  }

  hasWallet(chainId: string): boolean {
    const wallet = this.getWallet(chainId as any);
    return Boolean(wallet);
  }
}
