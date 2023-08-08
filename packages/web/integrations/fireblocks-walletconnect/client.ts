import { Wallet } from "@cosmos-kit/core";

import { WCClient } from "~/integrations/core-walletconnect";

export class FireblocksClient extends WCClient {
  constructor(walletInfo: Wallet) {
    super(walletInfo);
  }
}
