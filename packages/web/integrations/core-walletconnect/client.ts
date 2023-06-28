import {
  AminoSignResponse,
  OfflineAminoSigner,
  StdSignDoc,
} from "@cosmjs/amino";
import {
  Algo,
  DirectSignResponse,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";
import {
  AppUrl,
  DappEnv,
  DirectSignDoc,
  ExpiredError,
  Logger,
  Mutable,
  RejectedError,
  SignOptions,
  SignType,
  SimpleAccount,
  State,
  Wallet,
  WalletAccount,
  WalletClient,
  WalletClientActions,
  WalletConnectOptions,
} from "@cosmos-kit/core";
import SignClient from "@walletconnect/sign-client";
import {
  PairingTypes,
  SessionTypes,
  SignClientTypes,
} from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";
import EventEmitter from "events";
import Long from "long";

import { WCAccount, WCSignDirectRequest, WCSignDirectResponse } from "./types";
import { CoreUtil } from "./utils";

const EXPLORER_API = "https://explorer-api.walletconnect.com";

export class WCClient implements WalletClient {
  readonly walletInfo: Wallet;

  signClient?: SignClient;
  wcCloudInfo?: any; // info from WalletConnect Cloud Explorer
  actions?: WalletClientActions;
  qrUrl: Mutable<string>;
  appUrl: Mutable<AppUrl>;

  pairings: PairingTypes.Struct[] = [];
  sessions: SessionTypes.Struct[] = [];
  emitter?: EventEmitter;
  logger?: Logger;
  options?: WalletConnectOptions;
  relayUrl?: string;
  env?: DappEnv;

  constructor(walletInfo: Wallet) {
    if (!walletInfo.walletconnect) {
      throw new Error(
        `'walletconnect' info for wallet ${walletInfo.prettyName} is not provided in wallet registry.`
      );
    }
    this.walletInfo = walletInfo;

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
  get wcEncoding() {
    return this.walletInfo.walletconnect?.encoding || "hex";
  }

  // walletconnect wallet project id
  get wcProjectId() {
    return this.walletInfo.walletconnect?.projectId;
  }

  // walletconnect wallet mobile link
  get wcMobile() {
    return this.walletInfo.walletconnect?.mobile;
  }

  get accounts(): SimpleAccount[] {
    const accounts: {
      namespace: string;
      chainId: string;
      address: string;
    }[] = [];
    this.sessions.forEach((s) => {
      Object.entries(s.namespaces).forEach(([, nsValue]) => {
        nsValue.accounts.forEach((account) => {
          const [namespace, chainId, address] = account.split(":");
          accounts.push({
            namespace,
            chainId,
            address,
          });
        });
      });
    });
    return accounts;
  }

  deleteSession(topic: string) {
    const chainIds: string[] = [];
    this.sessions = this.sessions.filter((s) => {
      if (s.topic === topic) {
        s.namespaces.cosmos.accounts.forEach((account) => {
          const [, chainId] = account.split(":");
          chainIds.push(chainId);
        });
        return false;
      } else {
        return true;
      }
    });
    this.emitter?.emit("reset", chainIds);
    this.logger?.debug("[WALLET EVENT] Emit `reset`");
  }

  subscribeToEvents() {
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }

    this.signClient.on("session_ping", (args) => {
      this.logger?.debug("EVENT", "session_ping", args);
    });

    this.signClient.on("session_event", async (args) => {
      this.logger?.debug("EVENT", "session_event", args);
    });

    this.signClient.on("session_update", ({ topic, params }) => {
      this.logger?.debug("EVENT", "session_update", { topic, params });
    });

    this.signClient.on("session_delete", (args) => {
      this.logger?.debug("EVENT", "session_delete", args);
      this.deleteSession(args.topic);
    });

    this.signClient.on("session_expire", (args) => {
      this.logger?.debug("EVENT", "session_expire", args);
      this.deleteSession(args.topic);
    });

    this.signClient.on("session_proposal", (args) => {
      this.logger?.debug("EVENT", "session_proposal", args);
    });

    this.signClient.on("session_request", (args) => {
      this.logger?.debug("EVENT", "session_request", args);
    });

    this.signClient.on("proposal_expire", (args) => {
      this.logger?.debug("EVENT", "proposal_expire", args);
    });
  }

  async deleteInactivePairings() {
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }

    for (const pairing of this.signClient.pairing.getAll({ active: false })) {
      await this.signClient.pairing.delete(pairing.topic, {
        code: 7001,
        message: "Clear inactive pairings.",
      });
      this.logger?.debug("Delete inactive pairing:", pairing.topic);
    }
  }

  restorePairings() {
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    this.pairings = this.signClient.pairing
      .getAll({ active: true })
      .filter(
        (p) =>
          p.peerMetadata?.name === this.wcName &&
          p.expiry * 1000 > Date.now() + 1000
      );
    this.logger?.debug("RESTORED PAIRINGS: ", this.pairings);
  }

  get pairing(): PairingTypes.Struct | undefined {
    return this.pairings[0];
  }

  restoreSessions() {
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    this.sessions = this.signClient.session
      .getAll()
      .filter(
        (s) =>
          s.peer.metadata.name === this.wcName &&
          s.expiry * 1000 > Date.now() + 1000
      );
    this.logger?.debug("RESTORED SESSIONS: ", this.sessions);
  }

  getSession(namespace: string, chainId: string) {
    return this.sessions.find((s) =>
      s.namespaces[namespace]?.accounts?.find((account) =>
        account.startsWith(`${namespace}:${chainId}`)
      )
    );
  }

  get walletName() {
    return this.walletInfo.name;
  }

  get dappProjectId() {
    return this.options?.signClient.projectId;
  }

  setActions(actions: WalletClientActions) {
    this.actions = actions;
  }

  setQRState(state: State) {
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

  async init() {
    await this.initSignClient();
    if (this.isMobile) {
      await this.initAppUrl();
    }
  }

  async initSignClient() {
    if (
      this.signClient &&
      this.relayUrl === this.options?.signClient.relayUrl
    ) {
      return;
    }

    this.signClient = await SignClient.init(
      this.options?.signClient as SignClientTypes.Options
    );
    this.relayUrl = this.options?.signClient.relayUrl;

    this.logger?.debug("CREATED CLIENT: ", this.signClient);
    this.logger?.debug("relayerRegion ", this.options?.signClient.relayUrl);

    this.subscribeToEvents();
    this.restorePairings();
    this.restoreSessions();
  }

  async initWCCloudInfo() {
    const fetcUrl = `${EXPLORER_API}/v3/wallets?projectId=${this.dappProjectId}&sdks=sign_v2&search=${this.wcName}`;
    const fetched = await (await fetch(fetcUrl)).json();
    this.wcCloudInfo =
      fetched.listings[this.walletInfo.walletconnect?.projectId!];
    this.logger?.debug("WalletConnect Info:", this.wcCloudInfo);
  }

  async initAppUrl() {
    this.appUrl.state = State.Pending;

    if (!this.wcCloudInfo) await this.initWCCloudInfo();

    const native = this.wcCloudInfo.mobile.native || this.wcMobile?.native;
    const universal =
      this.wcCloudInfo.mobile.universal || this.wcMobile?.universal;

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

  get universalUrl() {
    return this.appUrl.data?.universal;
  }

  get redirectHref(): string | undefined {
    return this.nativeUrl || this.universalUrl;
  }

  get redirectHrefWithWCUri(): string | undefined {
    let href: string | undefined;
    if (this.nativeUrl) {
      href = (
        this.walletInfo.walletconnect?.formatNativeUrl ||
        CoreUtil.formatNativeUrl
      )(
        this.nativeUrl,
        this.qrUrl?.data ?? "",
        this.env?.os ?? "macos",
        this.walletName
      );
    } else if (this.universalUrl) {
      href = (
        this.walletInfo.walletconnect?.formatUniversalUrl ||
        CoreUtil.formatUniversalUrl
      )(this.universalUrl, this.qrUrl?.data ?? "", this.walletName);
    }
    return href;
  }

  get displayQRCode() {
    if (this.pairing || this.redirect) {
      return false;
    } else {
      return true;
    }
  }

  get redirect() {
    return Boolean(this.isMobile && (this.nativeUrl || this.universalUrl));
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
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }

    if (this.qrUrl.state !== "Init") {
      this.setQRState(State.Init);
    }

    const chainIdsWithNS =
      typeof chainIds === "string"
        ? [`cosmos:${chainIds}`]
        : chainIds.map((chainId) => `cosmos:${chainId}`);

    this.restorePairings();
    const pairing = this.pairing;
    this.logger?.debug("Restored active pairing topic is:", pairing?.topic);

    if (this.displayQRCode) this.setQRState(State.Pending);

    const requiredNamespaces = {
      cosmos: {
        methods: [
          "cosmos_getAccounts",
          "cosmos_signAmino",
          "cosmos_signDirect",
        ],
        chains: chainIdsWithNS,
        events: ["chainChanged", "accountsChanged"],
      },
    };
    let connectResp: Awaited<ReturnType<SignClient["connect"]>>;
    try {
      this.logger?.debug("Connecting chains:", chainIdsWithNS);

      // If there is an active pairing, restore the session
      if (
        this.pairing &&
        this.pairing.active &&
        this.accounts.some(({ chainId: id }) =>
          Array.isArray(chainIds) ? chainIds.includes(id) : id === chainIds
        )
      ) {
        this.restoreSessions();
        return;
      } else {
        connectResp = await this.signClient.connect({
          pairingTopic: pairing?.topic,
          requiredNamespaces,
        });
      }

      this.qrUrl.data = connectResp.uri;
      this.logger?.debug("Using QR URI:", connectResp.uri);
      if (this.displayQRCode) this.setQRState(State.Done);
    } catch (e) {
      const error = e as Error;
      this.logger?.error("Client connect error: ", error);
      if (this.displayQRCode) this.setQRError(error);
      return;
    }

    if (this.redirect) this.openApp();

    try {
      const session = await connectResp.approval();
      this.logger?.debug("Established session:", session);
      this.sessions.push(session);
      this.restorePairings();
    } catch (error) {
      this.logger?.error("Session approval error: ", error);
      await this.deleteInactivePairings();
      if (!error) {
        if (this.displayQRCode) this.setQRError(ExpiredError);
        throw new Error("Proposal Expired");
      } else if ((error as any).code == 5001) {
        throw RejectedError;
      } else {
        throw error;
      }
    } finally {
      if (!pairing && this.qrUrl.message !== ExpiredError.message) {
        this.setQRState(State.Init);
      }
    }
  }

  async disconnect() {
    if (typeof this.signClient === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (this.sessions.length === 0) {
      return;
    }

    await Promise.all(
      this.sessions.map(async (session) => {
        if (!this.signClient) return;

        try {
          this.logger?.debug("Delete session:", session);
          await this.signClient.disconnect({
            topic: session.topic,
            reason: getSdkError("USER_DISCONNECTED"),
          });
        } catch (error) {
          this.logger?.error(
            `SignClient.disconnect session ${session.topic} failed:`,
            error
          );
        }
      })
    );

    this.sessions = [];
    this.emitter?.emit("sync_disconnect");
    this.logger?.debug("[WALLET EVENT] Emit `sync_disconnect`");
  }

  async getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    let account = this.accounts.find(({ chainId: id }) => id === chainId);

    if (!account) {
      try {
        await this.connect(chainId);
        account = this.accounts.find(({ chainId: id }) => id === chainId);
      } catch {
        throw new Error(
          `Chain ${chainId} is not connected yet, please check the session approval namespaces`
        );
      }
    }

    return account as SimpleAccount;
  }

  getOfflineSignerAmino(chainId: string) {
    return {
      getAccounts: async () => {
        if (this.redirect) this.openApp();
        return [await this.getAccount(chainId)];
      },
      signAmino: (signerAddress: string, signDoc: StdSignDoc) =>
        this.signAmino(chainId, signerAddress, signDoc),
    } as OfflineAminoSigner;
  }

  getOfflineSignerDirect(chainId: string) {
    return {
      getAccounts: async () => {
        if (this.redirect) this.openApp();
        return [await this.getAccount(chainId)];
      },
      signDirect: (signerAddress: string, signDoc: DirectSignDoc) =>
        this.signDirect(chainId, signerAddress, signDoc),
    } as OfflineDirectSigner;
  }

  async getOfflineSigner(chainId: string, preferredSignType?: SignType) {
    if (preferredSignType === "amino" && this.getOfflineSignerAmino) {
      return this.getOfflineSignerAmino(chainId);
    }
    if (preferredSignType === "direct" && this.getOfflineSignerDirect) {
      return this.getOfflineSignerDirect(chainId);
    }
    return this.getOfflineSignerAmino
      ? this.getOfflineSignerAmino?.(chainId)
      : this.getOfflineSignerDirect(chainId);
  }

  protected async _getAccount(chainId: string) {
    const session = this.getSession("cosmos", chainId);
    if (!session) {
      throw new Error(`Session for ${chainId} not established yet.`);
    }
    const resp = await this.signClient?.request<[WCAccount]>({
      topic: session.topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_getAccounts",
        params: {},
      },
    });
    this.logger?.debug(`Response of cosmos_getAccounts`, resp);
    return resp;
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const account = await this._getAccount(chainId);

    if (!account) {
      throw new Error(`No account found for ${chainId}`);
    }

    const { address, algo, pubkey } = account[0];

    return {
      address,
      algo: algo as Algo,
      pubkey: new Uint8Array(Buffer.from(pubkey, this.wcEncoding)),
    };
  }

  protected async _signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    _signOptions?: SignOptions
  ) {
    const session = this.getSession("cosmos", chainId);
    if (!session) {
      throw new Error(`Session for ${chainId} not established yet.`);
    }

    const resp = await this.signClient?.request<AminoSignResponse>({
      topic: session.topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_signAmino",
        params: {
          signerAddress: signer,
          signDoc,
        },
      },
    });
    this.logger?.debug(`Response of cosmos_signAmino`, resp);
    return resp;
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ): Promise<AminoSignResponse> {
    const result = (await this._signAmino(
      chainId,
      signer,
      signDoc,
      signOptions
    )) as AminoSignResponse;
    return result;
  }

  protected async _signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    _signOptions?: SignOptions
  ) {
    const session = this.getSession("cosmos", chainId);

    if (!session) {
      throw new Error(`Session for ${chainId} not established yet.`);
    }

    if (
      !signDoc.accountNumber ||
      !signDoc.chainId ||
      !signDoc.authInfoBytes ||
      !signDoc.bodyBytes
    ) {
      throw new Error(`Malformed signDoc`);
    }

    const signDocValue: WCSignDirectRequest = {
      signerAddress: signer,
      signDoc: {
        chainId: signDoc.chainId,
        bodyBytes: Buffer.from(signDoc.bodyBytes).toString(this.wcEncoding),
        authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString(
          this.wcEncoding
        ),
        accountNumber: signDoc.accountNumber.toString(),
      },
    };

    const resp = await this.signClient?.request({
      topic: session.topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_signDirect",
        params: signDocValue,
      },
    });
    this.logger?.debug(`Response of cosmos_signDirect`, resp);
    return resp;
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    signOptions?: SignOptions
  ): Promise<DirectSignResponse> {
    console.log("bbb");
    const { signed, signature } = (await this._signDirect(
      chainId,
      signer,
      signDoc,
      signOptions
    )) as WCSignDirectResponse;
    return {
      signed: {
        chainId: signed.chainId,
        accountNumber: Long.fromString(signed.accountNumber, false),
        authInfoBytes: new Uint8Array(
          Buffer.from(signed.authInfoBytes, this.wcEncoding)
        ),
        bodyBytes: new Uint8Array(
          Buffer.from(signed.bodyBytes, this.wcEncoding)
        ),
      },
      signature,
    };
  }
}
