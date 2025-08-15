import {
  type EndpointOptions,
  MainWalletBase,
  type Wallet,
} from "@cosmos-kit/core";
import { initCosmosEWallet } from "@keplr-ewallet/ewallet-sdk-cosmos";

import { ChainEWallet } from "./chain-wallet";
import { EWalletClient } from "./client";

export class EWalletMainWallet extends MainWalletBase {
  constructor(
    walletInfo: Wallet,
    preferredEndpoints?: EndpointOptions["endpoints"]
  ) {
    super(walletInfo, ChainEWallet);
    this.preferredEndpoints = preferredEndpoints;
  }

  async initClient() {
    this.initingClient();
    try {
      // Initialize the Cosmos EWallet with API key
      const cosmosEWallet = await initCosmosEWallet({
        api_key:
          "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
      });

      if (!cosmosEWallet.success) {
        throw new Error(
          "Failed to initialize CosmosEWallet - initialization returned null"
        );
      }
      this.initClientDone(new EWalletClient(cosmosEWallet.data));
    } catch (error) {
      this.initClientError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
