import { WalletStatus } from "@cosmos-kit/core";
import { comparer, reaction } from "mobx";
import { useCallback, useSyncExternalStore } from "react";

import { useStore } from "~/stores";
import type { RootStore } from "~/stores/root";

type AccountStore = RootStore["accountStore"];
type Wallet = ReturnType<AccountStore["getWallet"]>;

/** Plain snapshot of a chain's wallet. A new object only when a field changes. */
export type WalletSnapshot = {
  /** Live wallet for imperative calls (e.g. `wallet.osmosis.send...`).
   *  Reading its fields during render won't re-render; use the fields below. */
  wallet: Wallet;
  address: string | undefined;
  walletStatus: WalletStatus | undefined;
  isWalletConnected: boolean;
  isReadyToSendTx: boolean;
  /** Tx type being signed or broadcast, "" when none. */
  txTypeInProgress: string;
};

function readSnapshot(accountStore: AccountStore, chainId: string) {
  const wallet = accountStore.getWallet(chainId);
  return {
    wallet,
    address: wallet?.address,
    walletStatus: wallet?.walletStatus,
    isWalletConnected: Boolean(wallet?.isWalletConnected),
    isReadyToSendTx: Boolean(wallet?.isReadyToSendTx),
    txTypeInProgress: wallet?.txTypeInProgress ?? "",
  } satisfies WalletSnapshot;
}

/** Bridges the MobX account store to React: one shared MobX reaction per
 *  store and chain, active while at least one component is subscribed. */
class WalletSnapshotStore {
  private snapshot: WalletSnapshot;
  private listeners = new Set<() => void>();
  private dispose: (() => void) | undefined;

  constructor(
    private readonly accountStore: AccountStore,
    private readonly chainId: string
  ) {
    this.snapshot = readSnapshot(accountStore, chainId);
  }

  getSnapshot = () => {
    // Without a reaction nothing keeps the snapshot current, so re-read it.
    if (!this.dispose) {
      const next = readSnapshot(this.accountStore, this.chainId);
      if (!comparer.shallow(this.snapshot, next)) this.snapshot = next;
    }
    return this.snapshot;
  };

  /** Swaps in `next` only when a field differs, so the snapshot stays stable. */
  private update(next: WalletSnapshot) {
    if (comparer.shallow(this.snapshot, next)) return;
    this.snapshot = next;
    this.listeners.forEach((notify) => notify());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    if (!this.dispose) {
      this.dispose = reaction(
        () => readSnapshot(this.accountStore, this.chainId),
        (next) => this.update(next),
        { equals: comparer.shallow }
      );
      // catch changes between the last render and this subscription
      this.update(readSnapshot(this.accountStore, this.chainId));
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.dispose?.();
        this.dispose = undefined;
      }
    };
  };
}

const snapshotStores = new WeakMap<
  AccountStore,
  Map<string, WalletSnapshotStore>
>();

function getSnapshotStore(accountStore: AccountStore, chainId: string) {
  let byChain = snapshotStores.get(accountStore);
  if (!byChain) {
    byChain = new Map();
    snapshotStores.set(accountStore, byChain);
  }
  let store = byChain.get(chainId);
  if (!store) {
    store = new WalletSnapshotStore(accountStore, chainId);
    byChain.set(chainId, store);
  }
  return store;
}

/** The wallet for a chain (Osmosis by default) as plain React state, so the
 *  component doesn't need `observer()` to re-render on wallet changes. */
export function useWallet(chainId?: string): WalletSnapshot {
  const { accountStore, chainStore } = useStore();
  const store = getSnapshotStore(
    accountStore,
    chainId ?? chainStore.osmosis.chainId
  );
  const getSnapshot = useCallback(() => store.getSnapshot(), [store]);
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
