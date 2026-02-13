import { EndpointOptions, Wallet } from "@cosmos-kit/core";

import { WCWallet } from "~/integrations/core-walletconnect";
import { ChainOkxMobile } from "~/integrations/okx-walletconnect/chain-wallet";
import { OkxClient } from "~/integrations/okx-walletconnect/client";

export class OkxMobileWallet extends WCWallet {
  constructor(
    walletInfo: Wallet,
    preferredEndpoints?: EndpointOptions["endpoints"]
  ) {
    super(walletInfo, ChainOkxMobile, OkxClient);
    this.preferredEndpoints = preferredEndpoints;
  }
}
