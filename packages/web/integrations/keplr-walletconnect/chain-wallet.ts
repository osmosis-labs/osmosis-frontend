import { ChainRecord, Wallet } from "@cosmos-kit/core";

import { ChainWC } from "~/integrations/core-walletconnect";
import { KeplrClient } from "~/integrations/keplr-walletconnect/client";

export class ChainKeplrMobile extends ChainWC {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo, KeplrClient);
  }
}
