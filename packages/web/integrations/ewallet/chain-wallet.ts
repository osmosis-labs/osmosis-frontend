import { ChainRecord, ChainWalletBase, Wallet } from "@cosmos-kit/core";
import type { CosmosEWallet } from "@keplr-ewallet/ewallet-sdk-cosmos";

import { EWalletMainWallet } from "./main-wallet";

export class EWalletChainWallet extends ChainWalletBase {
  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo);
  }

  async initClient(): Promise<void> {
    if (this.client) {
      return; // Already initialized
    }

    try {
      // Get the main wallet instance
      const mainWallet = this.mainWallet as EWalletMainWallet;

      // Ensure main wallet is initialized
      await mainWallet.initClient();

      // Get the cosmos ewallet instance
      const cosmosEWallet = mainWallet.getCosmosEWallet();

      if (!cosmosEWallet) {
        throw new Error(
          "CosmosEWallet instance not available from main wallet"
        );
      }

      this.logger?.info("[EWallet] Creating chain wallet client...");

      // Create a Keplr-compatible wrapper
      const keplrCompatibleWallet =
        this.createKeplrCompatibleInterface(cosmosEWallet);

      this.logger?.info("[EWallet] Chain wallet client created successfully");

      this.initClientDone(keplrCompatibleWallet);
    } catch (error) {
      const err = error as Error;
      this.logger?.error("[EWallet] Chain wallet initialization failed:", err);
      this.initClientError(err);
    }
  }

  private createKeplrCompatibleInterface(cosmosEWallet: CosmosEWallet): any {
    // Create a Keplr-compatible interface that wraps the CosmosEWallet
    return {
      // Core wallet info
      version: "ewallet-0.0.6-rc.43",
      mode: "ewallet",

      // Enable chain support
      enable: (chainId: string) => cosmosEWallet.enable(chainId),

      // Account management
      getKey: (chainId: string) => cosmosEWallet.getKey(chainId),
      getAccounts: () => cosmosEWallet.getAccounts(),
      getKeysSettled: (chainIds: string[]) =>
        cosmosEWallet.getKeysSettled(chainIds),

      // Signing operations
      signAmino: (
        chainId: string,
        signer: string,
        signDoc: any,
        signOptions?: any
      ) => cosmosEWallet.signAmino(chainId, signer, signDoc, signOptions),
      signDirect: (
        chainId: string,
        signer: string,
        signDoc: any,
        signOptions?: any
      ) => cosmosEWallet.signDirect(chainId, signer, signDoc, signOptions),
      signArbitrary: (
        chainId: string,
        signer: string,
        data: string | Uint8Array
      ) => cosmosEWallet.signArbitrary(chainId, signer, data),
      verifyArbitrary: (
        chainId: string,
        signer: string,
        data: string | Uint8Array,
        signature: any
      ) => cosmosEWallet.verifyArbitrary(chainId, signer, data, signature),

      // Offline signers
      getOfflineSigner: (chainId: string, signOptions?: any) =>
        cosmosEWallet.getOfflineSigner(chainId, signOptions),
      getOfflineSignerOnlyAmino: (chainId: string, signOptions?: any) =>
        cosmosEWallet.getOfflineSignerOnlyAmino(chainId, signOptions),
      getOfflineSignerAuto: (chainId: string, signOptions?: any) =>
        cosmosEWallet.getOfflineSignerAuto(chainId, signOptions),

      // Transaction sending
      sendTx: (
        chainId: string,
        tx: unknown,
        mode: "async" | "sync" | "block",
        options?: any
      ) => cosmosEWallet.sendTx(chainId, tx, mode, options),

      // Chain management
      experimentalSuggestChain: (chainInfo: any) =>
        cosmosEWallet.experimentalSuggestChain(chainInfo),

      // EWallet specific methods
      getCosmosChainInfo: () => cosmosEWallet.getCosmosChainInfo(),
      getPublicKey: () => cosmosEWallet.getPublicKey(),

      // Additional properties for compatibility
      isEWallet: true,
      _cosmosEWallet: cosmosEWallet, // Keep reference to original ewallet instance
    };
  }
}
