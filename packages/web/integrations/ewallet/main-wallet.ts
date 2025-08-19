import { type EndpointOptions, MainWalletBase } from "@cosmos-kit/core";
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
  private static initPromise: Promise<void> | undefined;
  private static ewallet: KeplrEWallet | null = null;
  private static cosmosEWallet: CosmosEWallet | null = null;

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
      await this.init();

      if (!EWalletMainWallet.eWallet) {
        throw new Error("eWallet not initialized after init()");
      }

      // Check if already signed in before calling signIn
      let isSignedIn = false;
      try {
        const publicKey = await EWalletMainWallet.eWallet.getPublicKey();
        isSignedIn = !!publicKey;
      } catch (error) {
        isSignedIn = false;
      }

      if (!isSignedIn) {
        await EWalletMainWallet.eWallet.signIn("google");
      }

      if (EWalletMainWallet.cosmosEWallet) {
        this.initClientDone(new EWalletClient(EWalletMainWallet.cosmosEWallet));
      } else {
        this.initClientError(new Error("CosmosEWallet not initialized"));
      }
    } catch (error) {
      this.initClientError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  init() {
    if (EWalletMainWallet.initPromise) {
      return EWalletMainWallet.initPromise
    }

    EWalletMainWallet.initPromise = this.initInternal();

    return EWalletMainWallet.initPromise
  }

  protected async initInternal() {
    console.log(
        `[EWalletMainWallet] Starting init with API key: ${this.apiKey?.substring(
            0,
            10
        )}...`
    );

    if (!EWalletMainWallet.eWallet) {
      console.log(`[EWalletMainWallet] Initializing KeplrEwalletCore...`);
      const result = await initKeplrEwalletCore({
        api_key: this.apiKey,
      });

      if (result && result.success) {
        EWalletMainWallet.eWallet = result.data;
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

    if (!EWalletMainWallet.cosmosEWallet && EWalletMainWallet.eWallet) {
      console.log(`[EWalletMainWallet] Initializing CosmosEWallet...`);
      const result = await initCosmosEWallet({
        api_key: this.apiKey,
      });

      if (result && result.success) {
        EWalletMainWallet.cosmosEWallet = result.data;
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

    if (!EWalletMainWallet.eWallet) {
      throw new Error("Ewallet not initialized");
    }

    // Check if already signed in before calling signIn
    let isSignedIn = false;
    try {
      console.log("XXX try get pubkey");
      const publicKey = await EWalletMainWallet.eWallet.getPublicKey();
      isSignedIn = !!publicKey;
    } catch (error) {
      console.log("!!!!", error);
      isSignedIn = false;
    }

    console.log("???? pubkey get", isSignedIn);
    if (!isSignedIn) {
      console.log("Calling signIn from connect method");
      await EWalletMainWallet.eWallet.signIn("google");
    }
  };
}
