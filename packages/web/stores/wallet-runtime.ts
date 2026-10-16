import type {
  AssetList as RegistryAssetList,
  Chain as RegistryChain,
} from "@chain-registry/types";
import {
  type ChainWalletBase,
  type MainWalletBase,
  State,
  type WalletConnectOptions,
  WalletManager,
  WalletStatus,
} from "@cosmos-kit/core";
import { Hash } from "@keplr-wallet/crypto/build/hash";
import {
  type AccountStoreWallet,
  canSignOneClick,
  type ChainBoundTxArguments,
  CosmosKitAccountsLocalStorageKey,
  type CosmosRegistryWallet,
  createWalletTxClient,
  getOneClickExtensionOptions,
  getWalletEndpoints,
  HasUsedOneClickTradingLocalStorageKey,
  logger,
  type OneClickTradingInfo,
  OneClickTradingLocalStorageKey,
  signOneClick,
  type TransactionPreparationContext,
  UseOneClickTradingLocalStorageKey,
  type WalletTxClient,
  type WalletTxDependencies,
  type WalletTxTransport,
} from "@osmosis-labs/tx";
import type { AssetList, Chain } from "@osmosis-labs/types";
import type { Currency } from "@osmosis-labs/unit";
import {
  apiClient,
  type KVStore,
  makeLocalStorageKVStore,
} from "@osmosis-labs/utils";
import axios from "axios";
import { createStore } from "zustand/vanilla";

import { findOsmosisCurrency, getChainInfo } from "~/config/chain";

type Wallet = AccountStoreWallet;
export type WalletSnapshot = {
  /** Cosmos Kit handle for imperative actions; read snapshot fields during render. */
  wallet: Wallet | undefined;
  address: string | undefined;
  walletStatus: WalletStatus | undefined;
  isWalletConnected: boolean;
  isReadyToSendTx: boolean;
  txTypeInProgress: string;
  message: string | undefined;
  oneClickTradingInfo: OneClickTradingInfo | null;
  useOneClickTrading: boolean;
  hasUsedOneClickTrading: boolean;
  isStateHydrated: boolean;
  connect: (walletName?: string, force?: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
  supportsChain: (chainId: string) => Promise<boolean>;
  matchError: (error: Error | string) => Error;
  setOneClickTradingInfo: WalletRuntime["setOneClickTradingInfo"];
  getOneClickTradingInfo: WalletRuntime["getOneClickTradingInfo"];
  setShouldUseOneClickTrading: WalletRuntime["setShouldUseOneClickTrading"];
  shouldBeSignedWithOneClickTrading: WalletRuntime["shouldBeSignedWithOneClickTrading"];

  signAndBroadcast: (
    ...args: ChainBoundTxArguments
  ) => ReturnType<WalletTxClient["signAndBroadcast"]>;
  estimateFee: (
    input: Omit<Parameters<WalletTxClient["estimateFee"]>[0], "wallet">
  ) => ReturnType<WalletTxClient["estimateFee"]>;
  simulatePositionMigration: (input: {
    messages: Parameters<
      WalletTxClient["simulatePositionMigration"]
    >[0]["messages"];
    bech32Address?: string;
  }) => ReturnType<WalletTxClient["simulatePositionMigration"]>;
  transactionContext: TransactionPreparationContext;
  /** Imperative cross-chain actions; use useWallet(chainId) for reactive state. */
  getChainWallet: (chainId: string) => WalletSnapshot;
};

type WalletState = {
  chains: Record<string, WalletSnapshot>;
  progress: Record<string, string>;
  oneClickTradingInfo: OneClickTradingInfo | null;
  useOneClickTrading: boolean;
  hasUsedOneClickTrading: boolean;
  isStateHydrated: boolean;
};
export type WalletRuntimeConfig = {
  chains: (Chain & { features?: string[] })[];
  assets: AssetList[];
  osmosisChainId: string;
  wallets?: MainWalletBase[];
  walletConnectOptions?: WalletConnectOptions;
  storage?: KVStore;
};

type WalletRuntimeOptions = WalletTxDependencies["options"] & {
  /** Resolve chain currencies, including assets registered at runtime. */
  findCurrency?: (chainId: string, denom: string) => Currency | undefined;
};

function equalSnapshot(a: WalletSnapshot, b: WalletSnapshot) {
  return (Object.keys(a) as (keyof WalletSnapshot)[]).every((key) =>
    Object.is(a[key], b[key])
  );
}

/** Provider-owned Cosmos Kit lifecycle and Zustand state. No legacy stores. */
export class WalletRuntime {
  readonly store = createStore<WalletState>(() => ({
    chains: {},
    progress: {},
    oneClickTradingInfo: null,
    useOneClickTrading: false,
    hasUsedOneClickTrading: false,
    isStateHydrated: false,
  }));
  private publishing = false;
  private mountVersion = 0;
  private readonly pendingMounts = new WeakMap<WalletManager, Promise<void>>();
  private readonly actions = new Map<
    string,
    Pick<
      WalletSnapshot,
      | "connect"
      | "disconnect"
      | "supportsChain"
      | "matchError"
      | "signAndBroadcast"
      | "estimateFee"
      | "simulatePositionMigration"
      | "transactionContext"
      | "setOneClickTradingInfo"
      | "getOneClickTradingInfo"
      | "setShouldUseOneClickTrading"
      | "shouldBeSignedWithOneClickTrading"
    >
  >();
  private manager: WalletManager;
  private unsubscribeKeystoreChange?: () => void;
  private wallets: MainWalletBase[];
  private readonly storage: KVStore;
  private sessionRevision = 0;
  private preferenceRevision = 0;
  private persistence = Promise.resolve();
  private readonly hydration: Promise<void>;
  readonly transactions: WalletTxClient;

  constructor(
    readonly config: WalletRuntimeConfig,
    private readonly options?: WalletRuntimeOptions,
    transport?: WalletTxTransport
  ) {
    this.storage = config.storage ?? makeLocalStorageKVStore("account_store");
    this.wallets = config.wallets ?? [];
    this.manager = this.createManager();
    this.transactions = createWalletTxClient({
      chains: config.chains,
      getWallet: this.getWallet,
      transport: transport ?? {
        post: (url, data) => axios.post(url, data),
        get: (url, options) => axios.get(url, options),
        request: apiClient,
      },
      hash: (bytes) => Hash.sha256(bytes),
      setTxTypeInProgress: this.setTxTypeInProgress,
      oneClick: {
        getInfo: this.getOneClickTradingInfo,
        shouldSign: (input) => this.shouldBeSignedWithOneClickTrading(input),
        extensionOptions: getOneClickExtensionOptions,
        sign: async (input) => {
          const registry = await this.transactions.getRegistry();
          const info = input.oneClickTradingInfo;
          return signOneClick(input, {
            chains: config.chains,
            registry,
            oneClickTradingInfo: info,
            osmosisChainId: config.osmosisChainId,
            isSessionCurrent: () =>
              this.store.getState().oneClickTradingInfo === info &&
              this.store.getState().useOneClickTrading,
          });
        },
      },
      options,
    });
    this.hydration = this.hydrate();
    // Storage can be unavailable in private browsing. Render a hydrated,
    // disabled session while keeping failures observable to explicit callers.
    void this.hydration.catch(() =>
      this.updateSession({ isStateHydrated: true })
    );
  }

  private createManager() {
    const chains = this.config.chains.map((chain) => ({
      ...chain,
      chain_type: "cosmos",
      network_type: chain.networkType,
      pretty_name: chain.prettyName,
      bech32_prefix: chain.bech32Prefix,
    })) as RegistryChain[];
    const assets = this.config.assets.map((list) => ({
      ...list,
      assets: list.assets.map((asset) => ({
        ...asset,
        base: asset.sourceDenom,
        denom_units: [
          { denom: asset.sourceDenom, exponent: 0 },
          { denom: asset.symbol, exponent: asset.decimals },
        ],
        display: asset.symbol,
      })),
    })) as unknown as RegistryAssetList[];
    const names = new Set(assets.map(({ chain_name }) => chain_name));
    for (const { chain_name } of chains)
      if (!names.has(chain_name)) assets.push({ chain_name, assets: [] });
    const manager = new WalletManager(
      chains,
      this.wallets,
      logger,
      true,
      // Refresh connected chain wallets without prompting for inactive chains.
      false,
      ["https://daodao.zone", "https://dao.daodao.zone"],
      assets,
      "icns",
      this.config.walletConnectOptions,
      undefined,
      { endpoints: getWalletEndpoints(chains) },
      {
        duration: 2 ** 31 - 1,
        callback: () => {
          if (typeof window !== "undefined")
            window.localStorage.removeItem(CosmosKitAccountsLocalStorageKey);
          void this.setOneClickTradingInfo(undefined);
        },
      }
    );
    const refresh = () => this.publish();
    manager.setActions({
      viewWalletRepo: refresh,
      data: refresh,
      state: refresh,
      message: refresh,
    });
    for (const repo of manager.walletRepos) {
      repo.setActions({ viewWalletRepo: refresh });
      for (const wallet of repo.wallets) {
        wallet.updateCallbacks({
          ...wallet.callbacks,
          afterDisconnect: async () => {
            if (wallet.chain.chain_id === this.config.osmosisChainId)
              await this.setOneClickTradingInfo(undefined);
          },
        });
        wallet.setActions({ data: refresh, state: refresh, message: refresh });
      }
    }
    return manager;
  }

  /**
   * Re-fetch the account of every connected chain wallet when the user
   * switches accounts in the wallet extension.
   *
   * cosmos-kit's own handler is not used: it bails out unless the main wallet
   * is connected, which never happens when chain wallets connect without sync
   * (as the app does), and when it does run it connects every active chain
   * wallet, prompting for chains the user never approved.
   */
  private subscribeKeystoreChange(walletManager: WalletManager) {
    this.unsubscribeKeystoreChange?.();
    this.unsubscribeKeystoreChange = undefined;
    if (typeof window === "undefined") return;

    let isSubscribed = true;
    // Chain wallets with a refresh in flight, flagged when another event
    // arrives meanwhile so the account is read again after it.
    const refreshing = new Map<ChainWalletBase, { rerun: boolean }>();
    // Chain wallets whose last refresh failed. They stay eligible so a later
    // event can recover them, until a disconnect resets their state.
    const failed = new Set<ChainWalletBase>();

    const isEligible = (chainWallet: ChainWalletBase) => {
      if (chainWallet.isWalletConnected) return true;
      if (failed.has(chainWallet) && chainWallet.state === State.Error) {
        return true;
      }
      failed.delete(chainWallet);
      return false;
    };

    const refreshAccount = async (chainWallet: ChainWalletBase) => {
      const inFlight = refreshing.get(chainWallet);
      if (inFlight) {
        inFlight.rerun = true;
        return;
      }

      const run = { rerun: false };
      refreshing.set(chainWallet, run);
      try {
        do {
          run.rerun = false;
          // A disconnect clears the account and a reconnect replaces it, so an
          // unchanged object means the connection is the one this read began on.
          const accountBefore = chainWallet.data;
          // Drop the result if it is superseded, or the wallet was disconnected,
          // reconnected or the manager rebuilt while it was being read.
          const isStale = () =>
            run.rerun ||
            !isSubscribed ||
            chainWallet.data !== accountBefore ||
            !isEligible(chainWallet);
          try {
            if (!chainWallet.client) throw new Error("Wallet client missing");
            const account = await chainWallet.client.getSimpleAccount(
              chainWallet.chainId
            );
            if (isStale()) continue;
            failed.delete(chainWallet);
            chainWallet.setData(account);
            chainWallet.setMessage(undefined);
            chainWallet.setState(State.Done);
          } catch (e) {
            if (isStale()) continue;
            logger.error(
              `Failed to refresh ${chainWallet.walletName} account on ${chainWallet.chainName}`,
              e
            );
            failed.add(chainWallet);
            try {
              chainWallet.setError(e instanceof Error ? e : String(e));
            } catch {
              // Rethrown since the manager is created with `throwErrors`.
            }
          }
        } while (run.rerun && isSubscribed);
      } finally {
        refreshing.delete(chainWallet);
      }
    };

    const listeners = walletManager.mainWallets.flatMap((mainWallet) => {
      const onKeystoreChange = () => {
        mainWallet
          .getChainWalletList(false)
          .filter(isEligible)
          .forEach((chainWallet) => {
            refreshAccount(chainWallet);
          });
      };

      return (mainWallet.walletInfo.connectEventNamesOnWindow ?? []).map(
        (eventName) => {
          window.addEventListener(eventName, onKeystoreChange);
          return () => window.removeEventListener(eventName, onKeystoreChange);
        }
      );
    });

    this.unsubscribeKeystoreChange = () => {
      isSubscribed = false;
      listeners.forEach((unsubscribe) => unsubscribe());
    };
  }

  get walletManager() {
    return this.manager;
  }
  get mainWallets() {
    return this.manager.mainWallets;
  }

  getWalletRepo = (chainId: string) => {
    const repo = this.manager.walletRepos.find(
      (repo) =>
        repo.chainName === chainId ||
        repo.chainRecord.chain?.chain_id === chainId
    );
    if (!repo) throw new Error(`Chain ${chainId} is not provided.`);
    repo.activate();
    return repo;
  };

  /** Cosmos Kit handle for transaction dependencies and imperative UI actions. */
  getWallet = (chainId: string): Wallet | undefined => {
    const wallet = this.getWalletRepo(chainId).current as Wallet | undefined;
    if (!wallet) return undefined;
    wallet.txTypeInProgress = this.store.getState().progress[chainId] ?? "";
    wallet.isReadyToSendTx =
      wallet.walletStatus === WalletStatus.Connected && Boolean(wallet.address);
    wallet.supportsChain =
      (wallet.walletInfo as CosmosRegistryWallet)?.supportsChain ??
      (async () => true);
    wallet.activate();
    return wallet;
  };

  setTxTypeInProgress = (chainId: string, type: string) => {
    this.store.setState((state) => ({
      progress: { ...state.progress, [chainId]: type },
    }));
    this.publish();
  };

  private updateSession(
    patch: Partial<
      Pick<
        WalletState,
        | "oneClickTradingInfo"
        | "useOneClickTrading"
        | "hasUsedOneClickTrading"
        | "isStateHydrated"
      >
    >
  ) {
    this.store.setState(patch);
    this.publish();
  }

  private async hydrate() {
    const sessionRevision = this.sessionRevision;
    const preferenceRevision = this.preferenceRevision;
    const [info, enabled, used] = await Promise.all([
      this.storage.get<OneClickTradingInfo>(OneClickTradingLocalStorageKey),
      this.storage.get<boolean>(UseOneClickTradingLocalStorageKey),
      this.storage.get<boolean>(HasUsedOneClickTradingLocalStorageKey),
    ]);
    this.updateSession({
      isStateHydrated: true,
      ...(sessionRevision === this.sessionRevision
        ? {
            oneClickTradingInfo: info ?? null,
            hasUsedOneClickTrading: Boolean(used),
          }
        : {}),
      ...(preferenceRevision === this.preferenceRevision &&
      sessionRevision === this.sessionRevision
        ? {
            useOneClickTrading: Boolean(
              info &&
              enabled &&
              BigInt(info.sessionPeriod.end) >
                BigInt(Date.now()) * BigInt(1_000_000)
            ),
          }
        : {}),
    });
  }

  private persist(write: () => Promise<void>) {
    const pending = this.persistence.then(write);
    this.persistence = pending.catch(() => undefined);
    return pending;
  }

  getOneClickTradingInfo = async () => {
    await this.hydration;
    return this.store.getState().oneClickTradingInfo ?? undefined;
  };

  setOneClickTradingInfo = async (info: OneClickTradingInfo | undefined) => {
    this.sessionRevision++;
    await this.persist(async () => {
      await this.storage.set(HasUsedOneClickTradingLocalStorageKey, true);
      await this.storage.set(OneClickTradingLocalStorageKey, info ?? null);
      this.updateSession({
        oneClickTradingInfo: info ?? null,
        hasUsedOneClickTrading: true,
      });
    });
  };

  setShouldUseOneClickTrading = async ({
    nextValue,
  }: {
    nextValue: boolean;
  }) => {
    this.preferenceRevision++;
    await this.persist(async () => {
      await this.storage.set(UseOneClickTradingLocalStorageKey, nextValue);
      this.updateSession({ useOneClickTrading: nextValue });
    });
  };

  shouldBeSignedWithOneClickTrading = async ({
    messages,
    chainId = this.config.osmosisChainId,
  }: {
    messages: Parameters<typeof canSignOneClick>[0]["messages"];
    chainId?: string;
  }) => {
    await this.hydration;
    const state = this.store.getState();
    return canSignOneClick({
      info: state.oneClickTradingInfo,
      enabled: state.useOneClickTrading,
      address: this.getWallet(chainId)?.address,
      chainId,
      osmosisChainId: this.config.osmosisChainId,
      messages,
    });
  };
  private read(chainId: string): WalletSnapshot {
    const wallet = this.getWallet(chainId);
    let actions = this.actions.get(chainId);
    if (!actions) {
      const runtime = this;
      actions = {
        connect: async (walletName, force = false) => {
          await this.getWalletRepo(chainId).connect(walletName, force);
        },
        disconnect: async () => {
          await this.getWallet(chainId)?.disconnect(true);
        },
        supportsChain: async (targetChainId) => {
          const connected = this.getWallet(this.config.osmosisChainId);
          if (!connected?.isWalletConnected) return false;
          return connected.supportsChain(targetChainId);
        },
        matchError: (error) => {
          const message = typeof error === "string" ? error : error.message;
          const info = this.getWallet(this.config.osmosisChainId)?.walletInfo;
          const matched = info?.matchError?.(message) ?? message;
          return typeof matched === "string" ? new Error(matched) : matched;
        },
        setOneClickTradingInfo: this.setOneClickTradingInfo,
        getOneClickTradingInfo: this.getOneClickTradingInfo,
        setShouldUseOneClickTrading: this.setShouldUseOneClickTrading,
        shouldBeSignedWithOneClickTrading: (input) =>
          this.shouldBeSignedWithOneClickTrading({ ...input, chainId }),
        signAndBroadcast: (...args) =>
          this.transactions.signAndBroadcast(chainId, ...args),
        estimateFee: (input) => {
          const wallet = this.getWallet(chainId);
          if (!wallet)
            throw new Error(`Wallet for chain ${chainId} is not provided.`);
          return this.transactions.estimateFee({ ...input, wallet });
        },
        simulatePositionMigration: (input) =>
          this.transactions.simulatePositionMigration({
            ...input,
            chainId,
            bech32Address:
              input.bech32Address ?? this.getWallet(chainId)?.address ?? "",
          }),
        transactionContext: {
          get address() {
            return runtime.getWallet(chainId)?.address ?? "";
          },
          chainId,
          chains: this.config.chains,
          findCurrency: (denom) =>
            this.options?.findCurrency
              ? this.options.findCurrency(chainId, denom)
              : (getChainInfo(chainId).currencies.find(
                  (currency) => currency.coinMinimalDenom === denom
                ) ?? findOsmosisCurrency(denom)),
          stakeCurrency: () => getChainInfo(chainId).stakeCurrency,
          simulatePositionMigration: (input) =>
            this.transactions.simulatePositionMigration(input),
        },
      };
      this.actions.set(chainId, actions);
    }
    return {
      wallet,
      address: wallet?.address,
      walletStatus: wallet?.walletStatus,
      isWalletConnected: Boolean(wallet?.isWalletConnected),
      isReadyToSendTx: Boolean(wallet?.isReadyToSendTx),
      txTypeInProgress: this.store.getState().progress[chainId] ?? "",
      message: wallet?.message,
      oneClickTradingInfo: this.store.getState().oneClickTradingInfo,
      useOneClickTrading: this.store.getState().useOneClickTrading,
      hasUsedOneClickTrading: this.store.getState().hasUsedOneClickTrading,
      isStateHydrated: this.store.getState().isStateHydrated,
      getChainWallet: this.getSnapshot,
      ...actions,
    };
  }

  getSnapshot = (chainId: string) => {
    // Before subscription (including SSR), refresh synchronously. Subscribed
    // renders only read Zustand; Cosmos Kit events update it through the adapter.
    if (!this.store.getState().chains[chainId]) {
      this.publish(chainId);
    }
    return this.store.getState().chains[chainId];
  };

  private publish = (chainId?: string) => {
    if (this.publishing) return;
    this.publishing = true;
    try {
      const previous = this.store.getState().chains;
      const chains = { ...previous };
      let changed = false;
      for (const id of chainId ? [chainId] : Object.keys(previous)) {
        const next = this.read(id);
        if (!previous[id] || !equalSnapshot(previous[id], next)) {
          chains[id] = next;
          changed = true;
        }
      }
      if (changed) this.store.setState({ chains });
    } finally {
      this.publishing = false;
    }
  };

  subscribe = (listener: () => void) => this.store.subscribe(listener);

  installWallet = async (wallet: MainWalletBase) => {
    const previous = this.manager;
    this.wallets = [...this.wallets, wallet];
    this.unsubscribeKeystoreChange?.();
    await previous.onUnmounted();
    if (previous.session.timeoutId !== undefined)
      clearTimeout(previous.session.timeoutId);
    this.manager = this.createManager();
    this.publish();
    return this.manager;
  };

  mount = () => {
    const version = this.mountVersion;
    const manager = this.manager;
    // Serialize restores of the same manager so stale cleanup cannot remove a
    // remount's listeners. A replacement must not wait for the old wallet's response.
    const previous = this.pendingMounts.get(manager) ?? Promise.resolve();
    const pending = previous.then(async () => {
      if (version !== this.mountVersion || manager !== this.manager) {
        return;
      }
      try {
        this.subscribeKeystoreChange(manager);
        await manager.onMounted();
      } finally {
        if (version !== this.mountVersion || manager !== this.manager) {
          manager.onUnmounted();
          if (manager.session.timeoutId !== undefined) {
            clearTimeout(manager.session.timeoutId);
          }
        }
      }
    });
    this.pendingMounts.set(
      manager,
      pending.catch(() => undefined)
    );
    return pending;
  };

  unmount = async () => {
    this.mountVersion++;
    this.unsubscribeKeystoreChange?.();
    const manager = this.manager;
    await manager.onUnmounted();
    if (manager.session.timeoutId !== undefined) {
      clearTimeout(manager.session.timeoutId);
    }
  };
}
