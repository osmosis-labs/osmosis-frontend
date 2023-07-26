import { ChainRecord, Wallet } from "@cosmos-kit/core";

import { ChainWC } from "../core-walletconnect";
import { KeplrClient } from "./client";

export class ChainKeplrMobile extends ChainWC {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo, KeplrClient);
  }
}
