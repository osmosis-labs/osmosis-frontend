import { EndpointOptions, Wallet } from "@cosmos-kit/core";

import { WCWallet } from "~/integrations/core-walletconnect";
import { ChainTrustMobile } from "~/integrations/trust-walletconnect/chain-wallet";
import { TrustClient } from "~/integrations/trust-walletconnect/client";

export class TrustMobileWallet extends WCWallet {
  constructor(
    walletInfo: Wallet,
    preferredEndpoints?: EndpointOptions["endpoints"]
  ) {
    super(walletInfo, ChainTrustMobile, TrustClient);
    this.preferredEndpoints = preferredEndpoints;
  }
}
