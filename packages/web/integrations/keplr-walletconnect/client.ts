// eslint-disable-next-line import/no-extraneous-dependencies
import { StdSignDoc } from "@cosmjs/amino";
import { Algo, OfflineDirectSigner } from "@cosmjs/proto-signing";
import {
  AppUrl,
  BroadcastMode,
  DappEnv,
  DirectSignDoc,
  ExpiredError,
  Logger,
  Mutable,
  RejectedError,
  SignOptions,
  SignType,
  State,
  SuggestToken,
  Wallet,
  WalletAccount,
  WalletClient,
  WalletClientActions,
} from "@cosmos-kit/core";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";
import { IConnector } from "@walletconnect/types";
import EventEmitter from "events";

import { CoreUtil } from "./utils";

export class KeplrWCClient implements WalletClient {
  client?: KeplrWalletConnectV1;
  qrUrl: Mutable<string>;
  appUrl: Mutable<AppUrl>;
  env?: DappEnv;
  logger?: Logger;
  actions?: WalletClientActions;
  emitter?: EventEmitter;

  constructor(
    readonly walletInfo: Wallet,
    public readonly connector: IConnector
  ) {
    if (!this.walletInfo.walletconnect) {
      throw new Error(
        `'walletconnect' info for wallet ${walletInfo.prettyName} is not provided in wallet registry.`
      );
    }

    this.qrUrl = { state: State.Init };
    this.appUrl = { state: State.Init };
  }

  get isMobile() {
    return this.env?.device === "mobile";
  }

  // walletconnect wallet name
  get wcName() {
    return this.walletInfo.walletconnect?.name;
  }

  // wallet defined bytes encoding
  get wcEncoding(): BufferEncoding {
    return this.walletInfo.walletconnect?.encoding || "hex";
  }

  // walletconnect wallet mobile link
  get wcMobile() {
    return this.walletInfo.walletconnect?.mobile;
  }

  get walletName() {
    return this.walletInfo.name;
  }

  get universalUrl() {
    return this.appUrl.data?.universal;
  }

  get redirectHref(): string | undefined {
    return this.nativeUrl || this.universalUrl;
  }

  async init() {
    if (this.isMobile) {
      await this.initAppUrl();
    }
  }

  async initAppUrl() {
    this.appUrl.state = State.Pending;

    const native = this.wcMobile?.native;
    const universal = this.wcMobile?.universal;

    this.appUrl.data = { native, universal };
    this.appUrl.state = State.Done;
  }

  get nativeUrl() {
    const native = this.appUrl.data?.native;
    if (typeof native === "string" || typeof native === "undefined") {
      return native;
    } else {
      const { android, ios, macos, windows } = native;
      switch (this.env?.os) {
        case "android":
          return android;
        case "ios":
          return ios;
        case "macos":
          return macos;
        case "windows":
          return windows;
        default:
          throw new Error(`Unknown os: ${this.env?.os}.`);
      }
    }
  }

  get redirectHrefWithWCUri(): string | undefined {
    let href: string | undefined;
    if (this.nativeUrl) {
      href = (
        this.walletInfo.walletconnect?.formatNativeUrl ||
        CoreUtil.formatNativeUrl
      )(
        this.nativeUrl,
        this.qrUrl.data ?? "",
        this.env?.os ?? "android",
        this.walletName
      );
    } else if (this.universalUrl) {
      href = (
        this.walletInfo.walletconnect?.formatUniversalUrl ||
        CoreUtil.formatUniversalUrl
      )(this.universalUrl, this.qrUrl.data ?? "", this.walletName);
    }
    return href;
  }

  get displayQRCode() {
    if (this.redirect) {
      return false;
    } else {
      return true;
    }
  }

  openApp(withWCUri = true) {
    const href = withWCUri ? this.redirectHrefWithWCUri : this.redirectHref;
    if (href) {
      this.logger?.debug("Redirecting:", href);
      CoreUtil.openHref(href);
    } else {
      this.logger?.error("No redirecting href.");
    }
  }

  async connect(chainIds: string | string[]) {
    if (this.qrUrl.state !== "Init") {
      this.setQRState(State.Init);
    }

    if (this.displayQRCode) this.setQRState(State.Pending);

    try {
      this.logger?.debug("Connecting chains:", chainIds);

      // Check if connection is already established
      if (!this.connector.connected) {
        await this.connector.createSession();
      }

      this.qrUrl.data = this.connector.uri;
      this.logger?.debug("Using QR URI:", this.connector.uri);

      if (this.displayQRCode) this.setQRState(State.Done);
    } catch (error) {
      this.logger?.error("Client connect error: ", error);
      if (this.displayQRCode) this.setQRError(error as Error);
      return;
    }

    if (this.redirect) this.openApp();

    try {
      await new Promise((resolve, reject) => {
        console.log(this.connector);
        this.connector.on("connect", (error) => {
          console.log(error);
          if (error) {
            reject(error);
          } else {
            this.client = new KeplrWalletConnectV1(this.connector);
            resolve(undefined);
          }
        });
      });
    } catch (error) {
      this.logger?.error("Session approval error: ", error);
      if (!error) {
        if (this.displayQRCode) this.setQRError(ExpiredError);
        throw new Error("Proposal Expired");
      } else if ((error as any).code == 5001) {
        throw RejectedError;
      } else {
        throw error;
      }
    } finally {
      if (this.qrUrl.message !== ExpiredError.message) {
        this.setQRState(State.Init);
      }
    }
  }

  async disconnect() {
    if (!this.client || !this.connector.connected) return;
    this.client = undefined;
    this.emitter?.emit("sync_disconnect");
    this.logger?.debug("[WALLET EVENT] Emit `sync_disconnect`");
  }

  get redirect() {
    return Boolean(this.isMobile && (this.nativeUrl || this.universalUrl));
  }

  async enable(chainIds: string | string[]) {
    await this.client?.enable(chainIds);
  }

  async suggestToken({ chainId, tokens, type }: SuggestToken) {
    if (type === "cw20") {
      for (const { contractAddress, viewingKey } of tokens) {
        await this.client?.suggestToken(chainId, contractAddress, viewingKey);
      }
    }
  }

  async getSimpleAccount(chainId: string) {
    const { address, username } = await this.getAccount(chainId);
    return {
      namespace: "cosmos",
      chainId,
      address,
      username,
    };
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    if (!this.client) throw new Error("WalletConnect not connected");
    const key = await this.client.getKey(chainId);
    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo as Algo,
      pubkey: key.pubKey,
    };
  }

  getOfflineSigner(chainId: string, preferredSignType?: SignType) {
    switch (preferredSignType) {
      case "amino":
        return this.getOfflineSignerAmino(chainId);
      case "direct":
        return this.getOfflineSignerDirect(chainId);
      default:
        return this.getOfflineSignerAmino(chainId);
    }
  }

  getOfflineSignerAmino(chainId: string) {
    return this.client!.getOfflineSignerOnlyAmino(chainId);
  }

  getOfflineSignerDirect(chainId: string) {
    return this.client!.getOfflineSigner(chainId) as OfflineDirectSigner;
  }

  setActions(actions: WalletClientActions) {
    this.actions = actions;
  }

  setQRState(state: State) {
    console.log("change qr state", state);
    this.qrUrl.state = state;
    this.actions?.qrUrl?.state?.(state);
  }

  setQRError(e?: Error | string) {
    this.setQRState(State.Error);
    this.qrUrl.message = typeof e === "string" ? e : e?.message;
    this.actions?.qrUrl?.message?.(this.qrUrl.message);
    if (typeof e !== "string" && e?.stack) {
      this.logger?.error(e.stack);
    }
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ) {
    return await this.client!.signAmino(chainId, signer, signDoc, signOptions);
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    signOptions?: SignOptions
  ) {
    return await this.client!.signDirect(chainId, signer, signDoc, signOptions);
  }

  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode) {
    return await this.client!.sendTx(chainId, tx, mode);
  }
}
