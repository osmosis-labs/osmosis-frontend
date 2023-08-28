import { EndpointOptions, Wallet } from "@cosmos-kit/core";

import { WCWallet } from "~/integrations/core-walletconnect";
import { ChainKeplrMobile } from "~/integrations/keplr-walletconnect/chain-wallet";
import { KeplrClient } from "~/integrations/keplr-walletconnect/client";

export class KeplrMobileWallet extends WCWallet {
  constructor(
    walletInfo: Wallet,
    preferredEndpoints?: EndpointOptions["endpoints"]
  ) {
    super(walletInfo, ChainKeplrMobile, KeplrClient);
    this.preferredEndpoints = preferredEndpoints;
  }
}
