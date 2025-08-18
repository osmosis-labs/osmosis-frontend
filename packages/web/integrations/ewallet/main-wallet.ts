import { type EndpointOptions, MainWalletBase } from "@cosmos-kit/core";
import { initCosmosEWallet } from "@keplr-ewallet/ewallet-sdk-cosmos";

import { type EWalletInfo } from "~/integrations/ewallet/registry";

import { ChainEWallet } from "./chain-wallet";
import { EWalletClient } from "./client";

export class EWalletMainWallet extends MainWalletBase {
  private apiKey: string;
  constructor(
    walletInfo: EWalletInfo,
    preferredEndpoints?: EndpointOptions["endpoints"]
  ) {
    super(walletInfo, ChainEWallet);
    this.preferredEndpoints = preferredEndpoints;
    this.apiKey = walletInfo.apiKey;
  }

  async initClient() {
    this.initingClient();
    try {
      // Initialize the Cosmos EWallet with API key
      const cosmosEWallet = await initCosmosEWallet({
        api_key: this.apiKey,
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
