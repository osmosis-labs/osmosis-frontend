import { EndpointOptions, MainWalletBase, Wallet } from "@cosmos-kit/core";
import WalletConnect from "@walletconnect/client";

import { KeplrChainWalletConnectV1 } from "./chain-wallet";
import { KeplrWCClient } from "./client";

export class KeplrMainWalletConnectV1 extends MainWalletBase {
  constructor(
    walletInfo: Wallet,
    preferredEndpoints?: EndpointOptions["endpoints"]
  ) {
    super(walletInfo, KeplrChainWalletConnectV1);
    this.preferredEndpoints = preferredEndpoints;
  }

  async initClient() {
    if (this.client) {
      return;
    }

    this.initingClient();
    try {
      const connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
        signingMethods: [
          "keplr_enable_wallet_connect_v1",
          "keplr_sign_amino_wallet_connect_v1",
        ],
      });

      const client = new KeplrWCClient(this.walletInfo, connector);
      client.logger = this.logger;
      client.emitter = this.emitter;
      client.env = this.env;
      await client.init();

      this.initClientDone(client);
    } catch (error) {
      this.logger?.error(error);
      this.initClientError(error as Error);
    }
  }
}
