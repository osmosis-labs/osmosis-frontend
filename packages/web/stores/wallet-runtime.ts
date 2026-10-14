import type { MainWalletBase } from "@cosmos-kit/core";
import { WalletStatus } from "@cosmos-kit/core";
import { Hash } from "@keplr-wallet/crypto/build/hash";
import {
  type ChainBoundTxArguments,
  createWalletTxClient,
  type OneClickTradingInfo,
  type TransactionPreparationContext,
  type WalletTxClient,
  type WalletTxDependencies,
  type WalletTxTransport,
} from "@osmosis-labs/tx";
import { apiClient } from "@osmosis-labs/utils";
import axios from "axios";
import { runInAction } from "mobx";
import { createStore } from "zustand/vanilla";

import { findOsmosisCurrency, getChainInfo } from "~/config/chain";
import type { RootStore } from "~/stores/root";

type LegacyAccountStore = RootStore["accountStore"];
type Wallet = ReturnType<LegacyAccountStore["getWallet"]>;

export type WalletSnapshot = {
  /** Temporary compatibility handle for injected transaction methods. */
  wallet: Wallet;
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
  connect: (walletName: string, force?: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
  supportsChain: (chainId: string) => Promise<boolean>;
  matchError: LegacyAccountStore["matchError"];
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

type WalletState = { chains: Record<string, WalletSnapshot> };

function equalSnapshot(a: WalletSnapshot, b: WalletSnapshot) {
  return (Object.keys(a) as (keyof WalletSnapshot)[]).every((key) =>
    Object.is(a[key], b[key])
  );
}

/** Provider-owned Cosmos Kit runtime. Zustand owns the snapshots consumed by
 * React; this adapter keeps legacy signing/package state compatible until the
 * transaction and session implementations are extracted. */
export class WalletRuntime {
  readonly store = createStore<WalletState>(() => ({ chains: {} }));
  private disposeAdapter: (() => void) | undefined;
  private subscribers = 0;
  private publishing = false;
  private mountVersion = 0;
  private readonly pendingMounts = new WeakMap<
    LegacyAccountStore["walletManager"],
    Promise<void>
  >();
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
    >
  >();

  readonly transactions: WalletTxClient;

  constructor(
    private readonly legacy: LegacyAccountStore,
    options?: WalletTxDependencies["options"],
    transport?: WalletTxTransport
  ) {
    this.transactions = createWalletTxClient({
      chains: legacy.chains,
      getWallet: (chainId) => legacy.getWallet(chainId),
      transport: transport ?? {
        post: (url, data) => axios.post(url, data),
        get: (url, options) => axios.get(url, options),
        request: apiClient,
      },
      hash: (bytes) => Hash.sha256(bytes),
      setTxTypeInProgress: (chainId, type) =>
        runInAction(() => {
          legacy.txTypeInProgressByChain.set(chainId, type);
        }),
      oneClick: legacy.oneClickSigningAdapter,
      options,
    });
  }

  private read(chainId: string): WalletSnapshot {
    const wallet = this.legacy.getWallet(chainId);
    let actions = this.actions.get(chainId);
    if (!actions) {
      const runtime = this;
      actions = {
        connect: async (walletName, force = false) => {
          await this.legacy.getWalletRepo(chainId).connect(walletName, force);
        },
        disconnect: async () => {
          await this.legacy.getWallet(chainId)?.disconnect(true);
        },
        supportsChain: async (targetChainId) => {
          const connected = this.legacy.getWallet(this.legacy.osmosisChainId);
          if (!connected?.isWalletConnected) return false;
          return connected.supportsChain(targetChainId);
        },
        matchError: (error) => this.legacy.matchError(error),
        signAndBroadcast: (...args) =>
          this.transactions.signAndBroadcast(chainId, ...args),
        estimateFee: (input) => {
          const wallet = this.legacy.getWallet(chainId);
          if (!wallet)
            throw new Error(`Wallet for chain ${chainId} is not provided.`);
          return this.transactions.estimateFee({ ...input, wallet });
        },
        simulatePositionMigration: (input) =>
          this.transactions.simulatePositionMigration({
            ...input,
            chainId,
            bech32Address:
              input.bech32Address ??
              this.legacy.getWallet(chainId)?.address ??
              "",
          }),
        transactionContext: {
          get address() {
            return runtime.legacy.getWallet(chainId)?.address ?? "";
          },
          chainId,
          chains: this.legacy.chains,
          findCurrency: (denom) =>
            getChainInfo(chainId).currencies.find(
              (currency) => currency.coinMinimalDenom === denom
            ) ?? findOsmosisCurrency(denom),
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
      txTypeInProgress: this.legacy.txTypeInProgressByChain.get(chainId) ?? "",
      message: wallet?.message,
      oneClickTradingInfo: this.legacy.oneClickTradingInfo,
      useOneClickTrading: this.legacy.useOneClickTrading,
      hasUsedOneClickTrading: this.legacy.hasUsedOneClickTrading,
      isStateHydrated: this.legacy.isStateHydrated,
      getChainWallet: this.getSnapshot,
      ...actions,
    };
  }

  getSnapshot = (chainId: string) => {
    // Before subscription (including SSR), refresh synchronously. Subscribed
    // renders only read Zustand; Cosmos Kit events update it through the adapter.
    if (!this.store.getState().chains[chainId] || !this.disposeAdapter) {
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

  subscribe = (listener: () => void) => {
    if (this.subscribers++ === 0) {
      this.disposeAdapter = this.legacy.subscribeState(() => this.publish());
    }
    const unsubscribe = this.store.subscribe(listener);
    // Cover events between render and subscription, and remount after cleanup.
    this.publish();
    return () => {
      unsubscribe();
      if (--this.subscribers === 0) {
        this.disposeAdapter?.();
        this.disposeAdapter = undefined;
      }
    };
  };

  /** Internal selection UI access while Cosmos Kit repositories are migrated. */
  getWalletRepo = (chainId: string) => this.legacy.getWalletRepo(chainId);

  installWallet = async (wallet: MainWalletBase) => {
    const previous = this.legacy.walletManager;
    const manager = await this.legacy.addWallet(wallet);
    if (previous.session.timeoutId !== undefined) {
      clearTimeout(previous.session.timeoutId);
    }
    this.publish();
    return manager;
  };

  get mainWallets() {
    return this.legacy.walletManager.mainWallets;
  }

  mount = () => {
    const version = this.mountVersion;
    const manager = this.legacy.walletManager;
    // Serialize restores of the same manager so stale cleanup cannot remove a
    // remount's listeners. A replacement must not wait for the old wallet's response.
    const previous = this.pendingMounts.get(manager) ?? Promise.resolve();
    const pending = previous.then(async () => {
      if (
        version !== this.mountVersion ||
        manager !== this.legacy.walletManager
      ) {
        return;
      }
      try {
        await manager.onMounted();
      } finally {
        if (
          version !== this.mountVersion ||
          manager !== this.legacy.walletManager
        ) {
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
    const manager = this.legacy.walletManager;
    await manager.onUnmounted();
    if (manager.session.timeoutId !== undefined) {
      clearTimeout(manager.session.timeoutId);
    }
  };
}
