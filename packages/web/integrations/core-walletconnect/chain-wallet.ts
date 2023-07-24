import {
  ChainRecord,
  ChainWalletBase,
  Mutable,
  State,
  Wallet,
  WalletConnectOptions,
} from "@cosmos-kit/core";

import { WCClient } from "~/integrations/core-walletconnect/client";
import { IWCClient } from "~/integrations/core-walletconnect/types";

export class ChainWC extends ChainWalletBase {
  WCClient: IWCClient;
  clientMutable: Mutable<WCClient> = { state: State.Init };
  options?: WalletConnectOptions;

  constructor(walletInfo: Wallet, chainInfo: ChainRecord, WCClient: IWCClient) {
    super(walletInfo, chainInfo);
    this.WCClient = WCClient;
  }

  setClientNotExist() {
    this.setState(State.Error);
    this.setMessage(this.clientMutable.message);
  }
}
