import { type EndpointOptions, MainWalletBase } from "@cosmos-kit/core";
import { ChainName, DisconnectOptions } from "@cosmos-kit/core/cjs/types";
import {
  initKeplrEwalletCore,
  KeplrEWallet,
} from "@keplr-ewallet/ewallet-sdk-core";
import {
  CosmosEWallet,
  initCosmosEWallet,
} from "@keplr-ewallet/ewallet-sdk-cosmos";

import { type EWalletInfo } from "~/integrations/ewallet/registry";

import { ChainEWallet } from "./chain-wallet";
import { EWalletClient } from "./client";

export class EWalletMainWallet extends MainWalletBase {
  private apiKey: string;
  private eWallet: KeplrEWallet | null = null;
  private cosmosEWallet: CosmosEWallet | null = null;

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
      await this.init();

      if (!this.eWallet) {
        throw new Error("eWallet not initialized after init()");
      }

      // Check if already signed in before calling signIn
      let isSignedIn = false;
      try {
        const publicKey = await this.eWallet.getPublicKey();
        isSignedIn = !!publicKey;
      } catch (error) {
        isSignedIn = false;
      }

      if (!isSignedIn) {
        await this.eWallet.signIn("google");
      }

      if (this.cosmosEWallet) {
        this.initClientDone(new EWalletClient(this.cosmosEWallet));
      } else {
        this.initClientError(new Error("CosmosEWallet not initialized"));
      }
    } catch (error) {
      this.initClientError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async init() {
    console.log(
      `[EWalletMainWallet] Starting init with API key: ${this.apiKey?.substring(
        0,
        10
      )}...`
    );

    if (!this.eWallet) {
      console.log(`[EWalletMainWallet] Initializing KeplrEwalletCore...`);
      const result = await initKeplrEwalletCore({
        api_key: this.apiKey,
      });

      if (result && result.success) {
        this.eWallet = result.data;
        console.log(
          `[EWalletMainWallet] KeplrEwalletCore initialized successfully`
        );
      } else {
        console.error(
          `[EWalletMainWallet] KeplrEwalletCore init failed:`,
          result?.err
        );
        throw new Error(result?.err || "Unknown initialization error");
      }
    }

    if (!this.cosmosEWallet && this.eWallet) {
      console.log(`[EWalletMainWallet] Initializing CosmosEWallet...`);
      const result = await initCosmosEWallet({
        api_key: this.apiKey,
      });

      if (result && result.success) {
        this.cosmosEWallet = result.data;
        console.log(
          `[EWalletMainWallet] CosmosEWallet initialized successfully`
        );
      } else {
        console.error(
          `[EWalletMainWallet] CosmosEWallet init failed:`,
          result?.err
        );
        throw new Error(
          result?.err || "Unknown cosmos ewallet initialization error"
        );
      }
    }
  }

  connect = async (
    _syncOrChainIds?: boolean | string | string[],
    _options?: any
  ) => {
    // Ensure client is initialized first
    if (this.state === "Init") {
      await this.initClient();
    }

    await this.init();

    if (!this.eWallet) {
      throw new Error("Ewallet not initialized");
    }

    // Check if already signed in before calling signIn
    let isSignedIn = false;
    try {
      const publicKey = await this.eWallet.getPublicKey();
      isSignedIn = !!publicKey;
    } catch (error) {
      isSignedIn = false;
    }

    if (!isSignedIn) {
      console.log("Calling signIn from connect method");
      await this.eWallet.signIn("google");
    }
  };

  async disconnectAll(
    activeOnly?: boolean,
    exclude?: ChainName,
    options?: DisconnectOptions
  ): Promise<void> {
    await super.disconnectAll(activeOnly, exclude, options);
    if (this.eWallet) {
      await this.eWallet.signOut();
    }
    this.eWallet = null;
    this.cosmosEWallet = null;
  }
}
