import { ChainRecord, ChainWalletBase, Wallet } from "@cosmos-kit/core";

export class EWalletWallet extends ChainWalletBase {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo);
  }

  async initClient() {}
}
