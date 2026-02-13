import { Wallet } from "@cosmos-kit/core";

import { WCClient } from "~/integrations/core-walletconnect";

export class OkxClient extends WCClient {
  constructor(walletInfo: Wallet) {
    super(walletInfo);
  }
}
