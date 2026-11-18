import { useCallback, useSyncExternalStore } from "react";

import { OsmosisChainInfo } from "~/config/chain";
import { useStore } from "~/stores";
import type { WalletSnapshot } from "~/stores/wallet-runtime";

export type { WalletSnapshot } from "~/stores/wallet-runtime";

/** Plain Zustand state for a chain's wallet (Osmosis by default). */
export function useWallet(chainId?: string): WalletSnapshot {
  const { walletRuntime } = useStore();
  const id = chainId ?? OsmosisChainInfo.chainId;
  const getSnapshot = useCallback(
    () => walletRuntime.getSnapshot(id),
    [walletRuntime, id]
  );
  return useSyncExternalStore(
    walletRuntime.subscribe,
    getSnapshot,
    getSnapshot
  );
}
