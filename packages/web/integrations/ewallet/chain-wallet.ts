import {
  type ChainRecord,
  ChainWalletBase,
  type Wallet,
} from "@cosmos-kit/core";

export class ChainEWallet extends ChainWalletBase {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo);
  }
}
