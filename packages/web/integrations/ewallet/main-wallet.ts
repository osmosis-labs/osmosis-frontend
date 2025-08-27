import { type EndpointOptions, MainWalletBase } from "@cosmos-kit/core";
import { ChainName, DisconnectOptions } from "@cosmos-kit/core/cjs/types";
import {
  CosmosEWallet,
  initCosmosEWallet,
} from "@keplr-ewallet/ewallet-sdk-cosmos";

import { type EWalletInfo } from "~/integrations/ewallet/registry";

import { ChainEWallet } from "./chain-wallet";
import { EWalletClient } from "./client";

export class EWalletMainWallet extends MainWalletBase {
  protected static cosmosEWallet: CosmosEWallet | null = null;
  protected static initPromise: Promise<CosmosEWallet> | null = null;

  private readonly apiKey: string;

  constructor(
    walletInfo: EWalletInfo,
    preferredEndpoints?: EndpointOptions["endpoints"]
  ) {
    super(walletInfo, ChainEWallet);
    this.preferredEndpoints = preferredEndpoints;
    this.apiKey = walletInfo.apiKey;
  }

  async initClient() {
    console.log("[EWalletMainWallet] initClient");
    this.initingClient();
    try {
      console.log(this);
      const ewallet = await EWalletMainWallet.initOnce(this.apiKey);

      this.initClientDone(new EWalletClient(ewallet));
    } catch (error) {
      this.initClientError(error as Error);
    }
  }

  protected static initOnce = async (
    apiKey: string
  ): Promise<CosmosEWallet> => {
    if (EWalletMainWallet.cosmosEWallet) {
      return EWalletMainWallet.cosmosEWallet;
    }

    if (EWalletMainWallet.initPromise) {
      return await EWalletMainWallet.initPromise;
    }

    EWalletMainWallet.initPromise = EWalletMainWallet.initInternal(apiKey);

    return EWalletMainWallet.initPromise;
  };

  protected static async initInternal(apiKey: string): Promise<CosmosEWallet> {
    const res = initCosmosEWallet({
      api_key: apiKey,
    });

    if (!res.success) {
      throw new Error(`Failed to initialize CosmosEWallet: ${res.err}`);
    }

    EWalletMainWallet.cosmosEWallet = res.data;

    if (localStorage.getItem("ewallet-auto-sign-in") !== "true") {
      await EWalletMainWallet.cosmosEWallet.eWallet.signIn("google");
      localStorage.setItem("ewallet-auto-sign-in", "true");
    }

    return EWalletMainWallet.cosmosEWallet;
  }

  async disconnectAll(
    activeOnly?: boolean,
    exclude?: ChainName,
    options?: DisconnectOptions
  ): Promise<void> {
    await super.disconnectAll(activeOnly, exclude, options);
    if (EWalletMainWallet.cosmosEWallet) {
      await EWalletMainWallet.cosmosEWallet.eWallet.signOut();
      localStorage.removeItem("ewallet-auto-sign-in");
    }
    EWalletMainWallet.cosmosEWallet = null;
  }
}
