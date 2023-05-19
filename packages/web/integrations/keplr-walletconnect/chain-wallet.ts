import {
  ChainRecord,
  ChainWalletBase,
  Mutable,
  State,
  Wallet,
} from "@cosmos-kit/core";

import { KeplrWCClient } from "./client";

export class KeplrChainWalletConnectV1 extends ChainWalletBase {
  clientMutable: Mutable<KeplrWCClient> = { state: State.Init };

  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo);
  }

  setClientNotExist() {
    this.setState(State.Error);
    this.setMessage(this.clientMutable.message);
  }
}
