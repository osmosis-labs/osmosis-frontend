import type { AssetList as CosmologyAssetList } from "@chain-registry/types";
import type { OfflineAminoSigner } from "@cosmjs/amino";
import type { StdFee } from "@cosmjs/launchpad";
import type {
  EncodeObject,
  OfflineDirectSigner,
  Registry,
} from "@cosmjs/proto-signing";
import type { AminoTypes, SignerData } from "@cosmjs/stargate";
import {
  MainWalletBase,
  WalletConnectOptions,
  WalletManager,
  WalletStatus,
} from "@cosmos-kit/core";
import { KVStore } from "@keplr-wallet/common";
import { BaseAccount } from "@keplr-wallet/cosmos";
import { Hash, PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { Dec } from "@keplr-wallet/unit";
import {
  ChainedFunctionifyTuple,
  ChainGetter,
  CosmosQueries,
  CosmwasmQueries,
  Functionify,
  QueriesStore,
} from "@osmosis-labs/keplr-stores";
import { queryRPCStatus } from "@osmosis-labs/server";
import {
  encodeAnyBase64,
  getOsmosisCodec,
  QuoteStdFee,
  SimulateNotAvailableError,
  TxTracer,
} from "@osmosis-labs/tx";
import type { AssetList, Chain } from "@osmosis-labs/types";
import {
  apiClient,
  ApiClientError,
  getChain,
  isNil,
  OneClickTradingMaxGasLimit,
  unixNanoSecondsToSeconds,
} from "@osmosis-labs/utils";
import axios from "axios";
import { Buffer } from "buffer/";
import type { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import dayjs from "dayjs";
import { action, autorun, makeObservable, observable, runInAction } from "mobx";
import { fromPromise, IPromiseBasedObservable } from "mobx-utils";
import { Optional, UnionToIntersection } from "utility-types";

import { makeLocalStorageKVStore } from "../kv-store";
import { OsmosisQueries } from "../queries";
import { InsufficientBalanceForFeeError } from "../ui-config";
import { getAminoConverters } from "./amino-converters";
import {
  AccountStoreWallet,
  CosmosRegistryWallet,
  DeliverTxResponse,
  OneClickTradingInfo,
  SignOptions,
  TxEvent,
  TxEvents,
} from "./types";
import {
  AccountStoreNoBroadcastErrorEvent,
  CosmosKitAccountsLocalStorageKey,
  getEndpointString,
  getPublicKeyTypeUrl,
  getWalletEndpoints,
  HasUsedOneClickTradingLocalStorageKey,
  logger,
  makeSignDocAmino,
  NEXT_TX_TIMEOUT_HEIGHT_OFFSET,
  OneClickTradingLocalStorageKey,
  removeLastSlash,
  UseOneClickTradingLocalStorageKey,
} from "./utils";
import { WalletConnectionInProgressError } from "./wallet-errors";

export const GasMultiplier = 1.5;

export class AccountStore<Injects extends Record<string, any>[] = []> {
  protected accountSetCreators: ChainedFunctionifyTuple<
    AccountStore<Injects>,
    [ChainGetter, string],
    Injects
  >;

  injectedAccounts = observable.map<
    string,
    UnionToIntersection<Injects[number]>
  >();

  @observable
  private _refreshRequests = 0;

  @observable
  useOneClickTrading = false;

  @observable.ref
  oneClickTradingInfo: OneClickTradingInfo | null = null;

  @observable
  hasUsedOneClickTrading = false;

  txTypeInProgressByChain = observable.map<string, string>();

  private _walletManager: WalletManager;
  private _wallets: MainWalletBase[] = [];

  private _kvStore: KVStore = makeLocalStorageKVStore("account_store");

  /**
   * Keep track of the promise based observable for each wallet and chain id.
   * Used to prevent multiple calls to the same promise based observable and cache
   * the result.
   */
  private _walletToSupportChainPromise = new Map<
    string,
    IPromiseBasedObservable<boolean>
  >();

  private _aminoTypes: AminoTypes | null = null;
  private _registry: Registry | null = null;

  private async getAminoTypes() {
    if (!this._aminoTypes) {
      const [{ AminoTypes }, aminoConverters] = await Promise.all([
        import("@cosmjs/stargate"),
        getAminoConverters(),
      ]);
      this._aminoTypes = new AminoTypes(aminoConverters);
    }
    return this._aminoTypes;
  }

  private async getRegistry() {
    if (!this._registry) {
      const [
        {
          cosmosProtoRegistry,
          cosmwasmProtoRegistry,
          ibcProtoRegistry,
          osmosisProtoRegistry,
        },
        { Registry },
      ] = await Promise.all([
        import("@osmosis-labs/proto-codecs"),
        import("@cosmjs/proto-signing"),
      ]);

      this._registry = new Registry([
        ...cosmwasmProtoRegistry,
        ...cosmosProtoRegistry,
        ...ibcProtoRegistry,
        ...osmosisProtoRegistry,
      ]);
    }
    return this._registry;
  }

  /**
   * We make sure that the 'base' field always has as its value the native chain parameter
   * and not values derived from the IBC connection with Osmosis
   */
  private get walletManagerAssets() {
    return this.assets.map((assetList) => ({
      ...assetList,
      assets: assetList.assets.map((asset) => ({
        ...asset,
        base: asset.sourceDenom,
        denom_units: [
          {
            denom: asset.sourceDenom,
            exponent: 0,
          },
          {
            denom: asset.symbol,
            exponent: asset.decimals,
          },
        ],
        display: asset.symbol,
      })),
    })) as CosmologyAssetList[];
  }

  constructor(
    public readonly chains: (Chain & { features?: string[] })[],
    readonly osmosisChainId: string,
    protected readonly assets: AssetList[],
    protected readonly wallets: MainWalletBase[],
    protected readonly queriesStore: QueriesStore<
      [CosmosQueries, CosmwasmQueries, OsmosisQueries]
    >,
    protected readonly chainGetter: ChainGetter,
    protected readonly options: {
      walletConnectOptions?: WalletConnectOptions;
      preTxEvents?: TxEvents;
      broadcastUrl?: string;
      simulateUrl?: string;
      wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    } = {},
    ...accountSetCreators: ChainedFunctionifyTuple<
      AccountStore<Injects>,
      [ChainGetter, string],
      Injects
    >
  ) {
    this._wallets = wallets;
    this._walletManager = this._createWalletManager(wallets);
    this.accountSetCreators = accountSetCreators;

    makeObservable(this);

    autorun(async () => {
      const isOneClickTradingEnabled = await this.getShouldUseOneClickTrading();
      const oneClickTradingInfo = await this.getOneClickTradingInfo();
      const hasUsedOneClickTrading = await this.getHasUsedOneClickTrading();
      runInAction(() => {
        this.useOneClickTrading = isOneClickTradingEnabled;
        this.oneClickTradingInfo = oneClickTradingInfo ?? null;
        this.hasUsedOneClickTrading = hasUsedOneClickTrading;
      });
    });
  }

  private _createWalletManager(wallets: MainWalletBase[]) {
    this._walletManager = new WalletManager(
      this.chains,
      wallets,
      logger,
      true,
      true,
      ["https://daodao.zone", "https://dao.daodao.zone"],
      this.walletManagerAssets,
      "icns",
      this.options.walletConnectOptions,
      undefined,
      {
        endpoints: getWalletEndpoints(this.chains),
      },
      {
        duration: 31556926000, // 1 year
        callback: () => {
          window?.localStorage.removeItem(CosmosKitAccountsLocalStorageKey);
          this.setOneClickTradingInfo(undefined);
        },
      }
    );

    this._walletManager.setActions({
      viewWalletRepo: () => this.refresh(),
      data: () => this.refresh(),
      state: () => this.refresh(),
      message: () => this.refresh(),
    });
    this._walletManager.walletRepos.forEach((repo) => {
      repo.setActions({
        viewWalletRepo: () => this.refresh(),
      });
      repo.wallets.forEach((wallet) => {
        wallet.updateCallbacks({
          ...wallet.callbacks,
          afterDisconnect: async () => {
            const osmosisChain = this.chains[0];
            // Remove the one click trading info if the Osmosis wallet is disconnected.
            const oneClickTradingInfo = await this.getOneClickTradingInfo();
            if (
              oneClickTradingInfo &&
              wallet.chainName === osmosisChain.chain_name
            ) {
              this.setOneClickTradingInfo(undefined);
            }
          },
        });

        wallet.setActions({
          data: () => this.refresh(),
          state: () => this.refresh(),
          message: () => this.refresh(),
        });
      });
    });

    this.refresh();

    return this._walletManager;
  }

  @action
  private refresh() {
    this._refreshRequests++;
  }

  async addWallet(wallet: MainWalletBase) {
    this._wallets = [...this._wallets, wallet];
    // Unmount the previous wallet manager.
    await this._walletManager.onUnmounted();
    this._createWalletManager(this._wallets);
    return this._walletManager;
  }

  get walletManager() {
    // trigger a refresh as we don't have access to the internal methods of the wallet manager.
    this._refreshRequests;
    return this._walletManager;
  }

  /**
   * Get wallet repository for a given chain name or chain id.
   *
   * @param chainNameOrId - Chain name or chain id
   * @returns Wallet repository
   */
  getWalletRepo(chainNameOrId: string) {
    const walletRepo = this.walletManager.walletRepos.find(
      (repo) =>
        repo.chainName === chainNameOrId ||
        repo.chainRecord.chain?.chain_id === chainNameOrId
    );

    if (!walletRepo) {
      throw new Error(`Chain ${chainNameOrId} is not provided.`);
    }

    walletRepo.activate();
    return walletRepo;
  }

  /**
   * Get the current wallet for the given chain id
   * @param chainNameOrId - Chain Id
   * @returns AccountStoreWallet
   */
  getWallet(chainNameOrId: string) {
    const walletRepo = this.getWalletRepo(chainNameOrId);
    const wallet = walletRepo.current;
    const txInProgress = this.txTypeInProgressByChain.get(chainNameOrId);

    if (wallet) {
      const walletWithAccountSet = wallet as AccountStoreWallet<Injects>;

      const injectedAccountsForChain = this.getInjectedAccounts(chainNameOrId);

      /**
       * Merge the accounts into the wallet.
       */
      for (const key of Object.keys(injectedAccountsForChain as object)) {
        if (
          walletWithAccountSet[
            key as keyof UnionToIntersection<Injects[number]>
          ]
        ) {
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        walletWithAccountSet[key] = injectedAccountsForChain[key];
      }

      const walletInfo = wallet.walletInfo as CosmosRegistryWallet;

      walletWithAccountSet.txTypeInProgress = txInProgress ?? "";
      walletWithAccountSet.isReadyToSendTx =
        walletWithAccountSet.walletStatus === WalletStatus.Connected &&
        Boolean(walletWithAccountSet.address);
      walletWithAccountSet.activate();
      walletWithAccountSet.supportsChain =
        walletInfo?.supportsChain ??
        /**
         * Set it to true by default, allowing any errors to be confirmed through a real wallet connection.
         */
        (async () => true);

      return walletWithAccountSet;
    }

    return wallet;
  }

  /**
   * This method is used to get the injected accounts for a given chain.
   * If the injected accounts for the chain are already available, it returns them.
   * Otherwise, it creates new injected accounts by iterating over the account set creators.
   *
   * @param chainNameOrId - The name or id of the chain for which to get the injected accounts.
   * @returns The injected accounts for the given chain.
   */
  getInjectedAccounts(
    chainNameOrId: string
  ): UnionToIntersection<Injects[number]> {
    const previousInjectedAccounts = this.injectedAccounts.get(chainNameOrId);
    if (previousInjectedAccounts) {
      return previousInjectedAccounts;
    }

    const newInjectedAccounts = {} as UnionToIntersection<Injects[number]>;

    for (let i = 0; i < this.accountSetCreators.length; i++) {
      const fn = this.accountSetCreators[i] as Functionify<
        [AccountStore<Injects>, ChainGetter, string],
        Injects[number]
      >;
      const r = fn(this, this.chainGetter, chainNameOrId);

      for (const key of Object.keys(r)) {
        if (
          newInjectedAccounts[key as keyof UnionToIntersection<Injects[number]>]
        ) {
          continue;
        }

        newInjectedAccounts[key as keyof UnionToIntersection<Injects[number]>] =
          r[key];
      }
    }

    this.injectedAccounts.set(chainNameOrId, newInjectedAccounts);
    return newInjectedAccounts;
  }

  hasWallet(string: string): boolean {
    const wallet = this.getWallet(string);
    return Boolean(wallet);
  }

  connectedWalletSupportsChain(
    chainId: string
  ): IPromiseBasedObservable<boolean> | undefined {
    if (!chainId) return undefined;

    /**
     * Retrieve the Osmosis chain wallet. Other wallets might not be connected
     * due to lack of support or pending approval. However, Osmosis is always
     * approved upon connecting to the app.
     */
    const wallet = this.getWallet(this.osmosisChainId);

    if (!wallet || wallet.walletStatus !== WalletStatus.Connected) {
      return undefined;
    }

    const id = `${wallet.walletName}_${chainId}`;

    let promiseObservable = this._walletToSupportChainPromise.get(id);

    if (!promiseObservable) {
      promiseObservable = fromPromise<boolean>(wallet.supportsChain(chainId));
      this._walletToSupportChainPromise.set(id, promiseObservable);
    }

    return promiseObservable;
  }

  /**
   * Standardizes wallet-specific errors into predefined error types.
   *
   * @param {Error | string} error - The error or message from a wallet.
   *
   * @returns {Error | WalletConnectionInProgressError} - The appropriate error type
   * or the original error message within an `Error`.
   */
  matchError(error: Error | string): Error | WalletConnectionInProgressError {
    const errorMessage = typeof error === "string" ? error : error.message;
    const wallet = this.getWallet(this.osmosisChainId);

    // If the wallet isn't found, return the error
    if (!wallet) return new Error(errorMessage);

    const walletInfo = wallet.walletInfo as CosmosRegistryWallet;

    // If the wallet has a custom error matcher, use it
    if (walletInfo?.matchError) {
      const walletError = walletInfo.matchError(errorMessage);
      return typeof walletError === "string"
        ? new Error(walletError)
        : walletError;
    }

    // Return the error if nothing matches
    return new Error(errorMessage);
  }

  /**
   * Signs a transaction message and broadcasts it to the specified blockchain.
   *
   * @param chainNameOrId - Chain name or ID where the transaction will be broadcasted.
   * @param type - Type of the transaction - this string is used to identify the transaction going through the pipeline.
   * @param msgs - Array of messages to be included in the transaction or a function that returns such array.
   * @param memo - Optional memo for the transaction. Default is an empty string.
   * @param fee - Optional transaction fee details, if not provided the fee will be estimated.
   * @param _signOptions - Optional Keplr sign options for customizing the sign process.
   * @param onTxEvents - Optional callback or set of callbacks to be called based on transaction lifecycle events:
   *   - `onBroadcastFailed`: Invoked when the broadcast fails.
   *   - `onBroadcasted`: Invoked when the transaction is successfully broadcasted.
   *   - `onFulfill`: Invoked when the transaction is successfully fulfilled.
   *
   * @throws {Error} Throws an error if:
   *   - Wallet for the given chain is not provided or not connected.
   *   - There are no messages to send.
   *   - Wallet address is missing.
   *   - Broadcasting the transaction fails.
   *
   * @returns {Promise<void>} Resolves when the transaction is broadcasted and all events are processed, otherwise it rejects.
   */
  async signAndBroadcast(
    chainNameOrId: string,
    type: string | "unknown",
    msgs: EncodeObject[] | (() => Promise<EncodeObject[]> | EncodeObject[]),
    memo = "",
    fee?: StdFee,
    signOptions?: SignOptions,
    onTxEvents?:
      | ((tx: DeliverTxResponse) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: DeliverTxResponse) => void;
        }
  ) {
    runInAction(() => {
      this.txTypeInProgressByChain.set(chainNameOrId, type);
    });

    const wallet = this.getWallet(chainNameOrId);

    if (!wallet) {
      throw new Error(`Wallet for chain ${chainNameOrId} is not provided.`);
    }

    try {
      if (wallet.walletStatus !== WalletStatus.Connected) {
        throw new Error(`Wallet for chain ${chainNameOrId} is not connected.`);
      }

      if (typeof msgs === "function") {
        msgs = await msgs();
      }

      if (msgs.length === 0) {
        throw new Error("There is no msg to send");
      }

      let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
      let onFulfill: ((tx: DeliverTxResponse) => void) | undefined;

      if (onTxEvents) {
        if (typeof onTxEvents === "function") {
          onFulfill = onTxEvents;
        } else {
          onBroadcasted = onTxEvents?.onBroadcasted;
          onFulfill = onTxEvents?.onFulfill;
        }
      }

      if (!wallet.address) {
        throw new Error(
          "Address is required to estimate fee. Try connect to fetch address."
        );
      }

      const mergedSignOptions = {
        ...wallet.walletInfo?.signOptions,
        ...signOptions,
      };

      // Estimate gas fee & token if not provided
      if (typeof fee === "undefined") {
        try {
          fee = await this.estimateFee({
            wallet,
            messages: msgs,
            signOptions: mergedSignOptions,
          });
        } catch (e) {
          if (e instanceof SimulateNotAvailableError) {
            console.warn(
              "Gas simulation not supported for chain ID:",
              chainNameOrId
            );
          }

          throw e;
        }
      }

      const txRaw = await this.sign({
        wallet,
        fee,
        memo: memo || "",
        messages: msgs,
        signOptions: mergedSignOptions,
      });
      const { TxRaw } = await import("cosmjs-types/cosmos/tx/v1beta1/tx");
      const encodedTx = TxRaw.encode(txRaw).finish();

      const restEndpoint = getEndpointString(
        await wallet.getRestEndpoint(true)
      );

      const res = await axios.post<{
        tx_response: {
          height: string;
          txhash: string;
          codespace: string;
          code: number;
          data: string;
          raw_log: string;
          logs: unknown[];
          info: string;
          gas_wanted: string;
          gas_used: string;
          tx: unknown;
          timestamp: string;
          events: unknown[];
        };
      }>(this.options?.broadcastUrl ?? "/api/broadcast-transaction", {
        restEndpoint: removeLastSlash(restEndpoint),
        tx_bytes: Buffer.from(encodedTx).toString("base64"),
        mode: "BROADCAST_MODE_SYNC",
      });

      const broadcasted = res.data.tx_response;

      const rpcEndpoint = getEndpointString(await wallet.getRpcEndpoint(true));

      const txTracer = new TxTracer(rpcEndpoint, "/websocket", {
        wsObject: this?.options?.wsObject,
      });

      if (broadcasted.code) {
        const { BroadcastTxError } = await import("@cosmjs/stargate");
        throw new BroadcastTxError(broadcasted.code, "", broadcasted.raw_log);
      }

      const txHashBuffer = Buffer.from(broadcasted.txhash, "hex");

      if (this.options.preTxEvents?.onBroadcasted) {
        this.options.preTxEvents.onBroadcasted(chainNameOrId, txHashBuffer);
      }

      if (onBroadcasted) {
        onBroadcasted(txHashBuffer);
      }

      const tx = await txTracer.traceTx(txHashBuffer).then(
        (tx: {
          data?: string;
          events?: TxEvent[];
          gas_used?: string;
          gas_wanted?: string;
          log?: string;
          code?: number;
          height?: number;
          tx_result?: {
            data: string;
            code?: number;
            codespace: string;
            events: TxEvent[];
            gas_used: string;
            gas_wanted: string;
            info: string;
            log: string;
          };
        }) => {
          txTracer.close();

          return {
            transactionHash: broadcasted.txhash.toLowerCase(),
            code: tx?.code ?? tx?.tx_result?.code ?? 0,
            height: tx?.height,
            rawLog: tx?.log ?? tx?.tx_result?.log ?? "",
            events: tx?.events ?? tx?.tx_result?.events,
            gasUsed: tx?.gas_used ?? tx?.tx_result?.gas_used ?? "",
            gasWanted: tx?.gas_wanted ?? tx?.tx_result?.gas_wanted ?? "",
          };
        }
      );

      runInAction(() => {
        this.txTypeInProgressByChain.set(chainNameOrId, "");
      });

      /**
       * Refetch balances.
       * After sending tx, the balances have probably changed due to the fee.
       */
      for (const feeAmount of fee.amount) {
        if (!wallet.address) continue;

        const queries = this.queriesStore.get(chainNameOrId);
        const bal = queries.queryBalances
          .getQueryBech32Address(wallet.address)
          .balances.find(
            (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
          );

        if (bal) {
          bal.waitFreshResponse();
        }
      }

      if (this.options.preTxEvents?.onFulfill) {
        this.options.preTxEvents.onFulfill(chainNameOrId, tx);
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    } catch (e) {
      const error = e as Error | AccountStoreNoBroadcastErrorEvent;
      runInAction(() => {
        this.txTypeInProgressByChain.set(chainNameOrId, "");
      });

      if (error instanceof AccountStoreNoBroadcastErrorEvent) {
        throw e;
      }

      if (this.options.preTxEvents?.onBroadcastFailed) {
        this.options.preTxEvents.onBroadcastFailed(chainNameOrId, error);
      }

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(error);
      }

      throw e;
    }
  }

  public async sign({
    wallet,
    messages,
    fee,
    memo,
    signOptions,
  }: {
    wallet: AccountStoreWallet;
    messages: readonly EncodeObject[];
    fee: StdFee;
    memo: string;
    signOptions?: SignOptions;
  }): Promise<TxRaw> {
    const { accountNumber, sequence } = await this.getSequence(wallet);
    const chainId = wallet?.chainId;

    if (!chainId) {
      throw new Error("Chain ID is not provided");
    }

    if (!wallet.offlineSigner) {
      await wallet.initOfflineSigner();
    }

    if (!wallet.offlineSigner) {
      throw new Error("Offline signer failed to initialize");
    }

    const offlineSigner = wallet.offlineSigner;

    const signerData: SignerData = {
      accountNumber: accountNumber,
      sequence: sequence,
      chainId: chainId,
    };

    const oneClickTradingInfo = await this.getOneClickTradingInfo();

    const isWithinNetworkFeeLimit =
      !!oneClickTradingInfo &&
      new Dec(fee.gas).lte(
        new Dec(
          typeof oneClickTradingInfo.networkFeeLimit !== "string"
            ? OneClickTradingMaxGasLimit
            : oneClickTradingInfo.networkFeeLimit
        )
      );

    if (
      signOptions?.useOneClickTrading &&
      /**
       * Should not surpass network fee limit.
       */
      isWithinNetworkFeeLimit
    ) {
      return this.signOneClick({
        wallet,
        signerAddress: wallet.address ?? "",
        messages,
        fee,
        memo,
        signerData,
      });
    }

    if (
      signOptions?.useOneClickTrading &&
      !isWithinNetworkFeeLimit &&
      this.options.preTxEvents?.onExceeds1CTNetworkFeeLimit
    ) {
      const confirmationState = await new Promise<"continue" | "finish">(
        (resolve) => {
          const fn = this.options.preTxEvents?.onExceeds1CTNetworkFeeLimit;
          if (!fn) return resolve("continue");
          fn({
            continueTx: () => resolve("continue"),
            finish: () => resolve("finish"),
          });
        }
      );
      if (confirmationState === "finish") {
        throw new AccountStoreNoBroadcastErrorEvent("User cancelled");
      }
    }

    const osmosis = await getOsmosisCodec();

    /**
     * If the message is an authenticator message, force the direct signing.
     * This is because the authenticator message should be signed with proto for now.
     */
    const isAuthenticatorMsg = messages.some(
      (message) =>
        message.typeUrl ===
          osmosis.smartaccount.v1beta1.MsgAddAuthenticator.typeUrl ||
        message.typeUrl ===
          osmosis.smartaccount.v1beta1.MsgRemoveAuthenticator.typeUrl
    );

    const forceSignDirect = isAuthenticatorMsg;

    return ("signAmino" in offlineSigner || "signAmino" in wallet.client) &&
      !forceSignDirect
      ? this.signAmino({
          wallet,
          signerAddress: wallet.address ?? "",
          messages,
          fee,
          memo,
          signerData,
          signOptions,
        })
      : this.signDirect({
          wallet,
          signerAddress: wallet.address ?? "",
          messages,
          fee,
          memo,
          signerData,
          signOptions,
        });
  }

  private async signOneClick({
    wallet,
    signerAddress,
    messages,
    fee,
    memo,
    signerData: { accountNumber, sequence, chainId },
  }: {
    wallet: AccountStoreWallet;
    signerAddress: string;
    messages: readonly EncodeObject[];
    fee: StdFee;
    memo: string;
    signerData: SignerData;
  }): Promise<TxRaw> {
    if (!wallet.offlineSigner) {
      throw new Error("offlineSigner is not available in wallet");
    }

    const accountFromSigner = (await wallet.offlineSigner.getAccounts()).find(
      (account) => account.address === signerAddress
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }

    const oneClickTradingInfo = await this.getOneClickTradingInfo();
    if (isNil(oneClickTradingInfo)) {
      throw new Error("One click trading info is not available");
    }

    if (memo === "") {
      // If the memo is empty, set it to "1CT" so we know it originated from the frontend for
      // QA purposes.
      memo = "1CT";
    } else {
      // Otherwise, tack on "1CT" to the end of the memo.
      memo += " \n1CT";
    }

    const [
      { encodeSecp256k1Pubkey, encodeSecp256k1Signature },
      { TxExtension },
      { fromBase64 },
      { Int53 },
      { makeAuthInfoBytes, makeSignDoc, encodePubkey },
      { TxRaw },
    ] = await Promise.all([
      import("@cosmjs/amino"),
      import(
        "@osmosis-labs/proto-codecs/build/codegen/osmosis/smartaccount/v1beta1/tx"
      ),
      import("@cosmjs/encoding"),
      import("@cosmjs/math"),
      import("@cosmjs/proto-signing"),
      import("cosmjs-types/cosmos/tx/v1beta1/tx"),
    ]);

    const pubkey = encodePubkey(
      encodeSecp256k1Pubkey(accountFromSigner.pubkey)
    );

    const pubKeyTypeUrl = getPublicKeyTypeUrl({
      chainId: wallet.chain.chain_id,
      chainFeatures:
        this.chains.find(({ chain_id }) => chain_id === wallet.chain.chain_id)
          ?.features ?? [],
    });

    pubkey.typeUrl = pubKeyTypeUrl;

    const registry = await this.getRegistry();
    const txBodyBytes = registry.encodeTxBody({
      messages,
      memo,
      nonCriticalExtensionOptions: [
        {
          typeUrl: "/osmosis.smartaccount.v1beta1.TxExtension",
          value: TxExtension.encode({
            selectedAuthenticators: [
              BigInt(oneClickTradingInfo.authenticatorId),
            ],
          }).finish(),
        },
      ],
    }) as Uint8Array;

    const privateKey = new PrivKeySecp256k1(
      fromBase64(oneClickTradingInfo.sessionKey)
    );

    const gasLimit = Int53.fromString(String(fee.gas)).toNumber();
    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence }],
      fee.amount,
      gasLimit,
      undefined,
      undefined
    );
    const signDoc = makeSignDoc(
      txBodyBytes,
      authInfoBytes,
      chainId,
      accountNumber
    );

    const sig = privateKey.signDigest32(
      Hash.sha256(
        SignDoc.encode(
          SignDoc.fromPartial({
            bodyBytes: signDoc.bodyBytes,
            authInfoBytes: signDoc.authInfoBytes,
            chainId: signDoc.chainId,
            accountNumber: signDoc.accountNumber.toString(),
          })
        ).finish()
      )
    );

    const signature = encodeSecp256k1Signature(
      privateKey.getPubKey().toBytes(),
      new Uint8Array([...sig.r, ...sig.s])
    );

    return TxRaw.fromPartial({
      bodyBytes: signDoc.bodyBytes,
      authInfoBytes: signDoc.authInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  private async signAmino({
    wallet,
    signerAddress,
    messages,
    fee,
    memo,
    signerData: { accountNumber, sequence, chainId },
    signOptions,
  }: {
    wallet: AccountStoreWallet;
    signerAddress: string;
    messages: readonly EncodeObject[];
    fee: StdFee;
    memo: string;
    signerData: SignerData;
    signOptions?: SignOptions;
  }): Promise<TxRaw> {
    if (!wallet.offlineSigner) {
      throw new Error("offlineSigner is not available in wallet");
    }

    if (
      !("signAmino" in wallet.client) &&
      !("signAmino" in wallet.offlineSigner)
    ) {
      throw new Error("signAmino is not available in wallet");
    }

    const accountFromSigner = (await wallet.offlineSigner.getAccounts()).find(
      (account) => account.address === signerAddress
    );

    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }

    if (memo === "") {
      // If the memo is empty, set it to "FE" so we know it originated from the frontend for
      // QA purposes.
      memo = "FE";
    } else {
      // Otherwise, tack on "FE" to the end of the memo.
      memo += " \nFE";
    }

    const [
      { encodeSecp256k1Pubkey },
      { encodePubkey, makeAuthInfoBytes },
      { fromBase64 },
      { Int53 },
      { TxRaw },
      { SignMode },
    ] = await Promise.all([
      import("@cosmjs/amino"),
      import("@cosmjs/proto-signing"),
      import("@cosmjs/encoding"),
      import("@cosmjs/math"),
      import("cosmjs-types/cosmos/tx/v1beta1/tx"),
      import("cosmjs-types/cosmos/tx/signing/v1beta1/signing"),
    ]);

    const pubkey = encodePubkey(
      encodeSecp256k1Pubkey(accountFromSigner.pubkey)
    );

    const pubKeyTypeUrl = getPublicKeyTypeUrl({
      chainId: wallet.chain.chain_id,
      chainFeatures:
        this.chains.find(({ chain_id }) => chain_id === wallet.chain.chain_id)
          ?.features ?? [],
    });

    pubkey.typeUrl = pubKeyTypeUrl;

    const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
    const aminoTypes = await this.getAminoTypes();
    const msgs = messages.map((msg) => {
      const res = aminoTypes.toAmino(msg);
      // Include the 'memo' field again because the 'registry' omits it
      if (msg.value.memo) {
        res.value.memo = msg.value.memo;
      }
      return res;
    });

    const timeoutHeight = await this.getTimeoutHeight(chainId);

    const signDoc = await makeSignDocAmino(
      msgs,
      fee,
      chainId,
      memo,
      accountNumber,
      sequence,
      timeoutHeight
    );

    const { signature, signed } = await (wallet.client.signAmino
      ? wallet.client.signAmino(
          wallet.chainId,
          signerAddress,
          signDoc,
          signOptions
        )
      : (wallet.offlineSigner as unknown as OfflineAminoSigner).signAmino(
          signerAddress,
          signDoc
        ));

    const registry = await this.getRegistry();
    const signedTxBodyBytes = registry.encodeTxBody({
      messages: signed.msgs.map((msg) => {
        const res = aminoTypes.fromAmino(msg);
        // Include the 'memo' field again because the 'registry' omits it
        if (msg.value.memo) {
          res.value.memo = msg.value.memo;
        }
        return res;
      }),
      memo: signed.memo,
      timeoutHeight: BigInt(signDoc.timeout_height ?? "0"),
    });

    const signedGasLimit = Int53.fromString(String(signed.fee.gas)).toNumber();
    const signedSequence = Int53.fromString(String(signed.sequence)).toNumber();
    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: signedSequence }],
      signed.fee.amount,
      signedGasLimit,
      signed.fee.granter,
      signed.fee.payer,
      signMode
    );

    return TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  // Gets the timeout height as the sum of the latest block height and an offset.
  // If for any reason we fail to get the latest block height, we disable the timeout height by returning
  // a string value of 0.
  private async getTimeoutHeight(chainId: string): Promise<bigint> {
    const chain = getChain({ chainId, chainList: this.chains });
    if (!chain) return BigInt("0");
    const status = await queryRPCStatus({ restUrl: chain.apis.rpc[0].address });
    return (
      BigInt(status.result.sync_info.latest_block_height) +
      NEXT_TX_TIMEOUT_HEIGHT_OFFSET
    );
  }

  private async signDirect({
    wallet,
    signerAddress,
    messages,
    fee,
    memo,
    signerData: { accountNumber, sequence, chainId },
    signOptions,
  }: {
    wallet: AccountStoreWallet;
    signerAddress: string;
    messages: readonly EncodeObject[];
    fee: StdFee;
    memo: string;
    signerData: SignerData;
    signOptions?: SignOptions;
  }): Promise<TxRaw> {
    if (!wallet.offlineSigner) {
      throw new Error("offlineSigner is not available in wallet");
    }

    if (
      !("signDirect" in wallet.client) &&
      !("signDirect" in wallet.offlineSigner)
    ) {
      throw new Error("signDirect is not available in wallet");
    }

    const accountFromSigner = (await wallet.offlineSigner.getAccounts()).find(
      (account) => account.address === signerAddress
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }

    const [
      { encodeSecp256k1Pubkey },
      { encodePubkey },
      { fromBase64 },
      { Int53 },
      { makeAuthInfoBytes, makeSignDoc },
      { TxRaw },
    ] = await Promise.all([
      import("@cosmjs/amino"),
      import("@cosmjs/proto-signing"),
      import("@cosmjs/encoding"),
      import("@cosmjs/math"),
      import("@cosmjs/proto-signing"),
      import("cosmjs-types/cosmos/tx/v1beta1/tx"),
    ]);

    const pubkey = encodePubkey(
      encodeSecp256k1Pubkey(accountFromSigner.pubkey)
    );

    const pubKeyTypeUrl = getPublicKeyTypeUrl({
      chainId: wallet.chain.chain_id,
      chainFeatures:
        this.chains.find(({ chain_id }) => chain_id === wallet.chain.chain_id)
          ?.features ?? [],
    });

    pubkey.typeUrl = pubKeyTypeUrl;

    if (memo === "") {
      // If the memo is empty, set it to "FE" so we know it originated from the frontend for
      // QA purposes.
      memo = "FE";
    } else {
      // Otherwise, tack on "FE" to the end of the memo.
      memo += " \nFE";
    }

    const txBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: messages,
        memo: memo,
      },
    };

    const registry = await this.getRegistry();
    const txBodyBytes = registry.encode(txBodyEncodeObject) as Uint8Array;
    const gasLimit = Int53.fromString(String(fee.gas)).toNumber();
    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence }],
      fee.amount,
      gasLimit,
      undefined,
      undefined
    );
    const signDoc = makeSignDoc(
      txBodyBytes,
      authInfoBytes,
      chainId,
      accountNumber
    );

    const { signature, signed } = await (wallet.client.signDirect
      ? wallet.client.signDirect(
          wallet.chainId,
          signerAddress,
          signDoc,
          signOptions
        )
      : (wallet.offlineSigner as unknown as OfflineDirectSigner).signDirect(
          signerAddress,
          signDoc
        ));

    return TxRaw.fromPartial({
      bodyBytes: signed.bodyBytes,
      authInfoBytes: signed.authInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  public async getAccountFromNode(wallet: AccountStoreWallet) {
    try {
      const endpoint = getEndpointString(await wallet?.getRestEndpoint(true));
      const address = wallet?.address;

      if (!address) {
        throw new Error("Address is not provided");
      }

      if (!endpoint) {
        throw new Error("Endpoint is not provided");
      }

      const account = await BaseAccount.fetchFromRest(
        axios.create({
          baseURL: removeLastSlash(endpoint),
        }),
        address,
        true
      );

      return {
        accountNumber: account.getAccountNumber(),
        sequence: account.getSequence(),
      };
    } catch (error: any) {
      throw error;
    }
  }

  public async getSequence(
    wallet: AccountStoreWallet
  ): Promise<{ accountNumber: number; sequence: number }> {
    const account = await this.getAccountFromNode(wallet);
    if (!account) {
      throw new Error(
        `Account '${wallet?.address}' does not exist on chain. Send some tokens there before trying to query sequence.`
      );
    }

    return {
      accountNumber: Number(account.accountNumber.toString()),
      sequence: Number(account.sequence.toString()),
    };
  }

  /**
   * Simulates a transaction and estimates the transaction fee (gas cost) needed to execute it.
   *
   * @param wallet - The wallet object containing information about the blockchain wallet.
   * @param messages - An array of message objects to be encoded and included in the transaction.
   * @param signOptions - Optional options for customizing the sign process.
   *
   * @returns A promise that resolves to the estimated transaction fee, including the estimated gas cost.
   *
   * @remarks
   * The function performs the following steps:
   * 1. Encodes the messages using the available registry.
   * 2. Constructs an unsigned transaction object, including specific signing modes, and possibly ignores the public key in simulation.
   * 3. Sends a POST request to simulate the transaction.
   * 4. Calculates the estimated gas used, multiplying by a fixed factor (1.5) to provide a buffer.
   * 5. Includes specific error handling for errors returned from the axios request.
   * 6. Utilizes a placeholder signature since the transaction signature is not actually verified.
   *
   * Note: The estimated gas might be slightly lower than actual given fluctuations in gas prices.
   * This is offset by multiplying the estimated gas by a fixed factor (1.5) to provide a buffer.
   *
   * @throws `SimulateNotAvailableError` if simulation is not available
   */
  public async estimateFee({
    wallet,
    messages,
    signOptions = {},
  }: {
    wallet: AccountStoreWallet;
    messages: readonly EncodeObject[];
    initialFee?: Optional<StdFee, "gas">;
    signOptions?: SignOptions;
  }): Promise<StdFee> {
    if (!wallet.address) throw new Error("No wallet address available.");

    try {
      const registry = await this.getRegistry();
      const encodedMessages = messages.map((m) => registry.encodeAsAny(m));

      // check for one click trading tx decoration
      const shouldBeSignedWithOneClickTrading =
        signOptions?.useOneClickTrading &&
        (await this.shouldBeSignedWithOneClickTrading({ messages }));
      const nonCriticalExtensionOptions = shouldBeSignedWithOneClickTrading
        ? await this.getOneClickTradingExtensionOptions({
            oneClickTradingInfo: await this.getOneClickTradingInfo(),
          })
        : undefined;

      apiClient("/api/transaction-scan", {
        data: {
          chainId: wallet.chainId,
          messages: encodedMessages.map(encodeAnyBase64),
          nonCriticalExtensionOptions:
            nonCriticalExtensionOptions?.map(encodeAnyBase64),
          bech32Address: wallet.address,
        },
      }).catch((e) => {
        console.error("API transaction scan error", e);
      });

      const estimate = await apiClient<QuoteStdFee>("/api/estimate-gas-fee", {
        data: {
          chainId: wallet.chainId,
          messages: encodedMessages.map(encodeAnyBase64),
          nonCriticalExtensionOptions:
            nonCriticalExtensionOptions?.map(encodeAnyBase64),
          bech32Address: wallet.address,
          gasMultiplier: GasMultiplier,
        } satisfies {
          chainId: string;
          messages: { typeUrl: string; value: string }[];
          nonCriticalExtensionOptions?: { typeUrl: string; value: string }[];
          bech32Address: string;
          onlyDefaultFeeDenom?: boolean;
          gasMultiplier: number;
        },
      });

      const getGasAmount =
        signOptions.preferNoSetFee || signOptions.useOneClickTrading;

      if (!getGasAmount) {
        return {
          gas: estimate.gas,
          amount: [],
        };
      }

      // avoid returning isSubtractiveFee, a utility returned from the estimateGasFee function that is not used here
      // Also, for now, only single-token fee payments are supported.
      return {
        gas: estimate.gas,
        amount: [
          {
            denom: estimate.amount[0].denom,
            amount: estimate.amount[0].amount,
          },
        ],
      };
    } catch (e) {
      if (e instanceof ApiClientError) {
        const apiClientError = e as ApiClientError<{
          code?: number;
          message: string;
        }>;

        const status = apiClientError.response?.status;
        const message = apiClientError.data?.message;

        if (status !== 400 || !message || typeof message !== "string") throw e;

        if (message.includes("invalid empty tx")) {
          throw new SimulateNotAvailableError(message);
        }

        if (
          message.includes(
            "No fee tokens found with sufficient balance on account"
          )
        ) {
          throw new InsufficientBalanceForFeeError(
            "Insufficient balance for transaction fees. Please add funds to continue."
          );
        }

        // If there is a code, it's a simulate tx error and we should forward its message.
        if (apiClientError?.data?.code) {
          throw new Error(apiClientError?.data?.message);
        }
      }

      throw e;
    }
  }

  /**
   * Determines if a transaction should be signed using one-click trading based on various conditions.
   */
  async shouldBeSignedWithOneClickTrading({
    messages,
  }: {
    messages: readonly EncodeObject[];
  }): Promise<boolean> {
    const isOneClickTradingEnabled = await this.isOneCLickTradingEnabled();
    const oneClickTradingInfo = await this.getOneClickTradingInfo();

    if (!oneClickTradingInfo || !isOneClickTradingEnabled) {
      return false;
    }

    const isAllowedMessageType = messages.every(({ typeUrl }) =>
      oneClickTradingInfo.allowedMessages.includes(typeUrl)
    );

    return isAllowedMessageType;
  }

  /**
   * Generates the extension options for one-click trading transactions.
   */
  async getOneClickTradingExtensionOptions({
    oneClickTradingInfo,
  }: {
    oneClickTradingInfo: OneClickTradingInfo | undefined;
  }) {
    if (!oneClickTradingInfo) return undefined;
    const { TxExtension } = await import(
      "@osmosis-labs/proto-codecs/build/codegen/osmosis/smartaccount/v1beta1/tx"
    );
    return [
      {
        typeUrl: "/osmosis.smartaccount.v1beta1.TxExtension",
        value: TxExtension.encode({
          selectedAuthenticators: [
            BigInt(oneClickTradingInfo?.authenticatorId),
          ],
        }).finish(),
      },
    ];
  }

  async getOneClickTradingInfo(): Promise<OneClickTradingInfo | undefined> {
    return this._kvStore.get<OneClickTradingInfo>(
      OneClickTradingLocalStorageKey
    );
  }

  async setOneClickTradingInfo(data: OneClickTradingInfo | undefined) {
    const nextValue = data ?? null;

    await this._kvStore.set<boolean>(
      HasUsedOneClickTradingLocalStorageKey,
      true
    );
    await this._kvStore.set(OneClickTradingLocalStorageKey, nextValue);

    /**
     * For some reason decorating this method with @action doesn't work when called
     * from walletAccountSet.disconnect. So, we use runInAction instead.
     */
    return runInAction(() => {
      this.oneClickTradingInfo = nextValue;
      this.hasUsedOneClickTrading = true;
    });
  }

  async isOneCLickTradingEnabled(): Promise<boolean> {
    const oneClickTradingInfo = await this.getOneClickTradingInfo();

    if (isNil(oneClickTradingInfo)) return false;

    return (
      !(await this.isOneClickTradingExpired()) &&
      Boolean(await this.getShouldUseOneClickTrading())
    );
  }

  async isOneClickTradingExpired(): Promise<boolean> {
    const oneClickTradingInfo = await this.getOneClickTradingInfo();

    if (isNil(oneClickTradingInfo)) return false;

    return dayjs
      .unix(unixNanoSecondsToSeconds(oneClickTradingInfo.sessionPeriod.end))
      .isBefore(dayjs());
  }

  /**
   * Sets the preference for using one-click trading.
   */
  @action
  async setShouldUseOneClickTrading({ nextValue }: { nextValue: boolean }) {
    this.useOneClickTrading = nextValue;
    await this._kvStore.set<boolean>(
      UseOneClickTradingLocalStorageKey,
      nextValue
    );
  }

  /**
   * Retrieves the user's preference for using one-click trading.
   * This preference is used to determine if one-click trading should be enabled or not.
   */
  async getShouldUseOneClickTrading() {
    return Boolean(
      await this._kvStore.get<boolean>(UseOneClickTradingLocalStorageKey)
    );
  }

  async getHasUsedOneClickTrading() {
    return Boolean(
      await this._kvStore.get<boolean>(HasUsedOneClickTradingLocalStorageKey)
    );
  }
}
