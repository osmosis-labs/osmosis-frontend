import { ChainRecord, Wallet } from "@cosmos-kit/core";

import { ChainWC } from "~/integrations/core-walletconnect";
import { OkxClient } from "~/integrations/okx-walletconnect/client";

export class ChainOkxMobile extends ChainWC {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo, OkxClient);
  }
}
