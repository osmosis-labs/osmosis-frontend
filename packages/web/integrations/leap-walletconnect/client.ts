import { Wallet } from "@cosmos-kit/core";

import { WCClient } from "../core-walletconnect";

export class LeapClient extends WCClient {
  constructor(walletInfo: Wallet) {
    super(walletInfo);
  }
}
