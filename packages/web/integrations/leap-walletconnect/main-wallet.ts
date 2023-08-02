import { EndpointOptions, Wallet } from "@cosmos-kit/core";

import { WCWallet } from "../core-walletconnect";
import { ChainLeapMobile } from "./chain-wallet";
import { LeapClient } from "./client";

export class LeapMobileWallet extends WCWallet {
  constructor(
    walletInfo: Wallet,
    preferredEndpoints?: EndpointOptions["endpoints"]
  ) {
    super(walletInfo, ChainLeapMobile, LeapClient);
    this.preferredEndpoints = preferredEndpoints;
  }
}
