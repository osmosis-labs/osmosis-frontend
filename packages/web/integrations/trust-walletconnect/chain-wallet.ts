import { ChainRecord, Wallet } from "@cosmos-kit/core";

import { ChainWC } from "~/integrations/core-walletconnect";

import { TrustClient } from "./client";

export class ChainTrustMobile extends ChainWC {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo, TrustClient);
  }
}
