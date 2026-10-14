import type { MainWalletBase } from "@cosmos-kit/core";
import { WalletStatus } from "@cosmos-kit/core";
import type { OneClickTradingInfo } from "@osmosis-labs/tx";
import { createStore } from "zustand/vanilla";

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
  private pendingMount: Promise<void> = Promise.resolve();
  private readonly actions = new Map<
    string,
    Pick<
      WalletSnapshot,
      "connect" | "disconnect" | "supportsChain" | "matchError"
    >
  >();

  constructor(private readonly legacy: LegacyAccountStore) {}

  private read(chainId: string): WalletSnapshot {
    const wallet = this.legacy.getWallet(chainId);
    let actions = this.actions.get(chainId);
    if (!actions) {
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
    // Serialize restores so a stale mount cannot remove the next mount's
    // listeners during Strict Mode cleanup or provider replacement.
    const pending = this.pendingMount.then(async () => {
      if (version !== this.mountVersion) return;
      const manager = this.legacy.walletManager;
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
    this.pendingMount = pending.catch(() => undefined);
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
