import type {
  AssetList as CosmologyAssetList,
  Chain as CosmologyChain,
} from "@chain-registry/types";
import { type StdFee } from "@cosmjs/amino";
import { type EncodeObject } from "@cosmjs/proto-signing";
import {
  MainWalletBase,
  WalletConnectOptions,
  WalletManager,
  WalletStatus,
} from "@cosmos-kit/core";
// The CommonJS barrel also loads mnemonic/BIP32 code and browser crypto polyfills.
import { Hash } from "@keplr-wallet/crypto/build/hash";
import {
  ChainedFunctionifyTuple,
  ChainGetter,
  Functionify,
} from "@osmosis-labs/keplr-stores";
import type {
  AccountStoreWallet,
  CosmosRegistryWallet,
  DeliverTxResponse,
  OneClickTradingInfo,
  SignOptions,
  TxEvents,
  TxFeMemoFlags,
} from "@osmosis-labs/tx";
import {
  canSignOneClick,
  getOneClickExtensionOptions,
  signOneClick,
} from "@osmosis-labs/tx";
import {
  CosmosKitAccountsLocalStorageKey,
  createWalletTxClient,
  getWalletEndpoints,
  HasUsedOneClickTradingLocalStorageKey,
  logger,
  type OneClickSigningAdapter,
  OneClickTradingLocalStorageKey,
  UseOneClickTradingLocalStorageKey,
  type WalletTxClient,
} from "@osmosis-labs/tx";
import type { AssetList, Chain } from "@osmosis-labs/types";
import type { KVStore } from "@osmosis-labs/utils";
import {
  apiClient,
  isNil,
  makeLocalStorageKVStore,
  unixNanoSecondsToSeconds,
  WalletConnectionInProgressError,
} from "@osmosis-labs/utils";
import axios from "axios";
import type { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import dayjs from "dayjs";
import {
  action,
  autorun,
  makeObservable,
  observable,
  observe,
  runInAction,
} from "mobx";
import { fromPromise, IPromiseBasedObservable } from "mobx-utils";
import { Optional, UnionToIntersection } from "utility-types";

export { GasMultiplier } from "@osmosis-labs/tx";

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

  @observable
  isStateHydrated = false;

  private sessionRevision = 0;
  private preferenceRevision = 0;

  txTypeInProgressByChain = observable.map<string, string>();

  private readonly stateListeners = new Set<() => void>();
  private stateDisposers: (() => void)[] = [];

  /** Compatibility boundary for non-MobX consumers. Cosmos Kit publishes via
   * refresh; legacy observable writes publish here without a React reaction. */
  subscribeState = (listener: () => void) => {
    this.stateListeners.add(listener);
    if (this.stateListeners.size === 1) {
      const notify = () => this.notifyState();
      this.stateDisposers = [
        observe(this.txTypeInProgressByChain, notify),
        observe(this, "oneClickTradingInfo", notify),
        observe(this, "useOneClickTrading", notify),
        observe(this, "hasUsedOneClickTrading", notify),
        observe(this, "isStateHydrated", notify),
      ];
    }
    return () => {
      this.stateListeners.delete(listener);
      if (this.stateListeners.size === 0) {
        this.stateDisposers.forEach((dispose) => dispose());
        this.stateDisposers = [];
      }
    };
  };

  private notifyState() {
    this.stateListeners.forEach((listener) => listener());
  }

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

  private _txClient: WalletTxClient | undefined;
  private get txClient(): WalletTxClient {
    return (this._txClient ??= createWalletTxClient({
      chains: this.chains,
      getWallet: (chainId) => this.getWallet(chainId),
      transport: {
        post: (url, data) => axios.post(url, data),
        get: (url, options) => axios.get(url, options),
        request: apiClient,
      },
      hash: (bytes) => Hash.sha256(bytes),
      setTxTypeInProgress: (chainId, type) =>
        runInAction(() => {
          this.txTypeInProgressByChain.set(chainId, type);
        }),
      oneClick: this.oneClickSigningAdapter,
      options: this.options,
    }));
  }

  /** Published AccountStore compatibility boundary for standalone transactions. */
  get oneClickSigningAdapter(): OneClickSigningAdapter {
    return {
      getInfo: () => this.getOneClickTradingInfo(),
      shouldSign: (input) => this.shouldBeSignedWithOneClickTrading(input),
      extensionOptions: (input) =>
        this.getOneClickTradingExtensionOptions(input),
      sign: (input) => this.signOneClick(input),
    };
  }

  private async getRegistry() {
    return this.txClient.getRegistry();
  }

  /**
   * We make sure that the 'base' field always has as its value the native chain parameter
   * and not values derived from the IBC connection with Osmosis
   */
  private get walletManagerAssets() {
    const assetLists = this.assets.map((assetList) => ({
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
    })) as unknown as CosmologyAssetList[];

    // Cosmos Kit fetches the asset list from GitHub's chain registry for any
    // chain it is not given one for. Supply an empty list instead so no
    // registry request is made for chains we ship without assets.
    const chainNamesWithAssets = new Set(
      assetLists.map(({ chain_name }) => chain_name)
    );
    for (const { chain_name } of this.chains) {
      if (!chainNamesWithAssets.has(chain_name)) {
        assetLists.push({ chain_name, assets: [] });
      }
    }
    return assetLists;
  }

  constructor(
    public readonly chains: (Chain & { features?: string[] })[],
    readonly osmosisChainId: string,
    protected readonly assets: AssetList[],
    protected readonly wallets: MainWalletBase[],
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
      const sessionRevision = this.sessionRevision;
      const preferenceRevision = this.preferenceRevision;
      const isOneClickTradingEnabled = await this.isOneClickTradingEnabled();
      const oneClickTradingInfo = await this.getOneClickTradingInfo();
      const hasUsedOneClickTrading = await this.getHasUsedOneClickTrading();
      runInAction(() => {
        if (this.preferenceRevision === preferenceRevision) {
          this.useOneClickTrading = isOneClickTradingEnabled;
        }
        if (this.sessionRevision === sessionRevision) {
          this.oneClickTradingInfo = oneClickTradingInfo ?? null;
          this.hasUsedOneClickTrading = hasUsedOneClickTrading;
        }
        this.isStateHydrated = true;
      });
    });
  }

  private _getCosmosKitCompatibleChains(): CosmologyChain[] {
    const chains = this.chains;

    return chains.map(
      (chain) =>
        ({
          ...chain,
          chain_type: "cosmos",
          network_type: chain.networkType,
          pretty_name: chain.prettyName,
          bech32_prefix: chain.bech32Prefix,
        }) as CosmologyChain
    );
  }

  private _createWalletManager(wallets: MainWalletBase[]) {
    const chains = this._getCosmosKitCompatibleChains();
    this._walletManager = new WalletManager(
      chains,
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
        endpoints: getWalletEndpoints(chains),
      },
      {
        // setTimeout fires immediately for delays above 2^31 - 1 ms, which
        // would expire the session right after connecting. ~24.8 days.
        duration: 2 ** 31 - 1,
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
    this.notifyState();
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
   * @param memoFlags - Optional warn-accept flags stamped into the auth memo's frontend tag (see `memo.ts`).
   *
   * @throws Throws an error if:
   *   - Wallet for the given chain is not provided or not connected.
   *   - There are no messages to send.
   *   - Wallet address is missing.
   *   - Broadcasting the transaction fails.
   *
   * @returns Resolves when the transaction is broadcasted and all events are processed, otherwise it rejects.
   */
  async signAndBroadcast(
    chainNameOrId: string,
    type: string | "unknown",
    msgs: EncodeObject[] | (() => Promise<EncodeObject[]> | EncodeObject[]),
    memo = "",
    fee?: StdFee,
    signOptions?: SignOptions,
    onTxEvents?:
      | ((tx: DeliverTxResponse) => void | Promise<void>)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: DeliverTxResponse) => void;
          /** Runs immediately before the broadcast POST with the hash of the
           *  signed tx, which is known before broadcast (sha256 of the tx
           *  bytes). A throw aborts the broadcast and discards the signed tx. */
          onSign?: (txHash: Uint8Array) => Promise<void> | void;
        },
    memoFlags?: TxFeMemoFlags,
    /** Expiry-bind a direct-signed transaction; see {@link sign}. */
    useTimeoutHeight?: boolean
  ) {
    return this.txClient.signAndBroadcast(
      chainNameOrId,
      type,
      msgs,
      memo,
      fee,
      signOptions,
      onTxEvents,
      memoFlags,
      useTimeoutHeight
    );
  }

  public async sign({
    wallet,
    messages,
    fee,
    memo,
    signOptions,
    memoFlags,
    useTimeoutHeight,
  }: {
    wallet: AccountStoreWallet;
    messages: readonly EncodeObject[];
    fee: StdFee;
    memo: string;
    signOptions?: SignOptions;
    memoFlags?: TxFeMemoFlags;
    /**
     * Expiry-bind a direct-signed transaction with the standard timeout
     * height offset. Opt-in per flow rather than app-wide: the amino path
     * has always set it, but changing every direct-signed transaction's
     * behavior is its own decision, so only flows whose safety model needs
     * a bounded broadcast window (the CL migration) pass true.
     */
    useTimeoutHeight?: boolean;
  }): Promise<TxRaw> {
    return this.txClient.sign({
      wallet,
      messages,
      fee,
      memo,
      signOptions,
      memoFlags,
      useTimeoutHeight,
    });
  }

  private async signOneClick(
    input: import("@osmosis-labs/tx").SessionSignRequest
  ): Promise<TxRaw> {
    return signOneClick(input, {
      chains: this.chains,
      registry: await this.getRegistry(),
      oneClickTradingInfo: await this.getOneClickTradingInfo(),
      osmosisChainId: this.osmosisChainId,
    });
  }

  public async getAccountFromNode(wallet: AccountStoreWallet) {
    return this.txClient.getAccountFromNode(wallet);
  }

  public async getSequence(
    wallet: AccountStoreWallet
  ): Promise<{ accountNumber: string; sequence: number }> {
    return this.txClient.getSequence(wallet);
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
    fallbackGasLimit,
  }: {
    wallet: AccountStoreWallet;
    messages: readonly EncodeObject[];
    initialFee?: Optional<StdFee, "gas">;
    signOptions?: SignOptions;
    fallbackGasLimit?: number;
  }): Promise<StdFee> {
    return this.txClient.estimateFee({
      wallet,
      messages,
      signOptions,
      fallbackGasLimit,
    });
  }

  /**
   * Simulates a position migration and returns the coins the account would
   * spend, used to derive the create-position message's minimum amounts.
   *
   * Distinct from `estimateFee`, which returns only gas and fee: this needs
   * the spent-coin totals from the simulation, and the gas route is on the
   * path of every transaction in the app.
   */
  public async simulatePositionMigration({
    chainId,
    messages,
    bech32Address,
  }: {
    chainId: string;
    messages: readonly EncodeObject[];
    bech32Address: string;
  }): Promise<{
    gasUsed: number;
    coinsSpent: { denom: string; amount: string }[];
    events: { type: string; attributes: { key: string; value: string }[] }[];
  }> {
    return this.txClient.simulatePositionMigration({
      chainId,
      messages,
      bech32Address,
    });
  }

  /**
   * Determines if a transaction should be signed using one-click trading based on various conditions.
   */
  async shouldBeSignedWithOneClickTrading({
    messages,
    chainId = this.osmosisChainId,
  }: {
    messages: readonly EncodeObject[];
    chainId?: string;
  }): Promise<boolean> {
    return canSignOneClick({
      info: await this.getOneClickTradingInfo(),
      enabled: await this.isOneClickTradingEnabled(),
      address:
        chainId === this.osmosisChainId
          ? this.getWallet(chainId)?.address
          : undefined,
      chainId,
      osmosisChainId: this.osmosisChainId,
      messages,
    });
  }

  async getOneClickTradingExtensionOptions(input: {
    oneClickTradingInfo: OneClickTradingInfo | undefined;
  }) {
    return getOneClickExtensionOptions(input);
  }

  async getOneClickTradingInfo(): Promise<OneClickTradingInfo | undefined> {
    return this._kvStore.get<OneClickTradingInfo>(
      OneClickTradingLocalStorageKey
    );
  }

  async setOneClickTradingInfo(data: OneClickTradingInfo | undefined) {
    const revision = ++this.sessionRevision;
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
      if (this.sessionRevision === revision) {
        this.oneClickTradingInfo = nextValue;
        this.hasUsedOneClickTrading = true;
      }
    });
  }

  async isOneClickTradingEnabled(): Promise<boolean> {
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
    this.preferenceRevision++;
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
