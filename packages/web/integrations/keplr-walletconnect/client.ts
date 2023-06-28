import { Wallet } from "@cosmos-kit/core";

import { WCClient } from "../core-walletconnect";

export class KeplrClient extends WCClient {
  constructor(walletInfo: Wallet) {
    super(walletInfo);
  }
}
