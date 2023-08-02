import { ChainRecord, Wallet } from "@cosmos-kit/core";

import { ChainWC } from "../core-walletconnect";
import { LeapClient } from "./client";

export class ChainLeapMobile extends ChainWC {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo, LeapClient);
  }
}
