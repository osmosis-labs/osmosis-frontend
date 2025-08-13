import { Wallet } from "@cosmos-kit/core";
import { MainWalletBase } from "@cosmos-kit/core";
import {
  type CosmosEWallet,
  initCosmosEWallet,
} from "@keplr-ewallet/ewallet-sdk-cosmos";

import { EWalletChainWallet } from "./chain-wallet";

export class EWalletMainWallet extends MainWalletBase {
  private cosmosEWallet: CosmosEWallet | null = null;

  constructor(walletInfo: Wallet) {
    super(walletInfo, EWalletChainWallet);
  }

  async initClient(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("EWallet is only available in browser environment");
    }

    if (this.cosmosEWallet) {
      return; // Already initialized
    }

    try {
      this.logger?.info("[EWallet] Starting main wallet initialization...", {
        has_api_key:
          "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
      });

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

      this.cosmosEWallet = cosmosEWallet.data;
      this.logger?.info("[EWallet] Main wallet initialized successfully");
    } catch (error) {
      const err = error as Error;
      this.logger?.error("[EWallet] Main wallet initialization failed:", err);
      throw new Error(
        `EWallet main wallet initialization failed: ${err.message}`
      );
    }
  }

  public getCosmosEWallet(): CosmosEWallet | null {
    return this.cosmosEWallet;
  }
}
