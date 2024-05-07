import { Wallet } from "@cosmos-kit/core";

import { WCClient } from "~/integrations/core-walletconnect";

export class TrustClient extends WCClient {
  constructor(walletInfo: Wallet) {
    super(walletInfo);
  }
}
