import { EndpointOptions, Wallet } from "@cosmos-kit/core";

import { WCWallet } from "../core-walletconnect";
import { ChainKeplrMobile } from "./chain-wallet";
import { KeplrClient } from "./client";

export class KeplrMobileWallet extends WCWallet {
  constructor(
    walletInfo: Wallet,
    preferredEndpoints?: EndpointOptions["endpoints"]
  ) {
    super(walletInfo, ChainKeplrMobile, KeplrClient);
    this.preferredEndpoints = preferredEndpoints;
  }
}
