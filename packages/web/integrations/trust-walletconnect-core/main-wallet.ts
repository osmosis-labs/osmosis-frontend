import type { Mutable, Wallet, WalletConnectOptions } from "@cosmos-kit/core";
import { MainWalletBase, State } from "@cosmos-kit/core";

import type { WCClient } from "./client";
import { IChainWC, IWCClient } from "./types";

export class WCWallet extends MainWalletBase {
  WCClient: IWCClient;
  clientMutable: Mutable<WCClient> = { state: State.Init };

  constructor(walletInfo: Wallet, ChainWC: IChainWC, WCClient: IWCClient) {
    if (!walletInfo.walletconnect) {
      throw new Error(
        `'walletconnect' info for wallet ${walletInfo.prettyName} is not provided in wallet registry.`
      );
    }
    super(walletInfo, ChainWC);
    this.WCClient = WCClient;
  }

  async initClient(options?: WalletConnectOptions) {
    if (!options) {
      this.initClientError(
        new Error("`walletconnectOptions` is not provided.")
      );
      return;
    }

    if (!options.signClient.projectId) {
      this.initClientError(
        new Error("`projectId` is not provided in `walletconnectOptions`.")
      );
      return;
    }

    this.initingClient();

    try {
      const client = new this.WCClient(this.walletInfo);
      client.logger = this.logger;
      client.emitter = this.emitter;
      client.env = this.env;
      client.options = options;

      this.initClientDone(client);
    } catch (e) {
      const error = e as Error;
      this.initClientError(error);
    }
  }
}
