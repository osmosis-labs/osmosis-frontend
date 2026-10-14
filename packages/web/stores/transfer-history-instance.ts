import { IbcTransferStatusProvider } from "@osmosis-labs/bridge/build/ibc/transfer-status";
import { Int3faceTransferStatusProvider } from "@osmosis-labs/bridge/build/int3face/transfer-status";
import { NomicTransferStatusProvider } from "@osmosis-labs/bridge/build/nomic/transfer-status";
import { SkipTransferStatusProvider } from "@osmosis-labs/bridge/build/skip/transfer-status";
import { SquidTransferStatusProvider } from "@osmosis-labs/bridge/build/squid/transfer-status";
import { makeIndexedKVStore } from "@osmosis-labs/stores";
import { useMemo } from "react";
import { useStore } from "zustand";

import { IS_TESTNET } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { checkSolanaSignatureOutcome } from "~/utils/solana";

import {
  TRANSFER_HISTORY_STORE_KEY,
  TransferHistoryStore,
} from "./transfer-history";

let instance: TransferHistoryStore | undefined;

/**
 * Process-wide transfer history store, created lazily on first access.
 * On the server it is inert (no restore, no persistence, no provider
 * polling is ever started), so IndexedDB is only ever touched in the browser.
 * The on-transfer-success callback is bound by `StoreProvider` via
 * `setOnAccountTransferSuccess` (it needs the tRPC utils from React context).
 */
export function getTransferHistoryStore(): TransferHistoryStore {
  if (instance) return instance;

  const isBrowser = typeof window !== "undefined";
  const network = IS_TESTNET ? "testnet" : "mainnet";

  const transferStatusProviders = [
    new SquidTransferStatusProvider(
      process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
      network,
      ChainList
    ),
    new SkipTransferStatusProvider(
      network,
      ChainList,
      {
        transactionStatus: async ({ chainID, txHash, env }) => {
          const response = await fetch(
            `/api/skip-tx-status?chainID=${chainID}&txHash=${txHash}&env=${env}`
          );
          const responseJson = await response.json();
          if (!response.ok) {
            throw new Error(
              "Failed to fetch transaction status: " + responseJson.error
            );
          }
          return responseJson;
        },
        trackTransaction: async ({ chainID, txHash, env }) => {
          const response = await fetch(
            `/api/skip-track-tx?chainID=${chainID}&txHash=${txHash}&env=${env}`
          );
          const responseJson = await response.json();
          if (!response.ok) {
            throw new Error(
              "Failed to track transaction: " + responseJson.error
            );
          }
          return responseJson;
        },
      },
      // Resolves Solana-signed transfers from the chain: a tx that never
      // landed is invisible to Skip, including after a reload.
      checkSolanaSignatureOutcome
    ),
    new IbcTransferStatusProvider(ChainList, AssetLists),
    new NomicTransferStatusProvider(ChainList, network),
    // Kept after the Int3face bridge provider's removal so past int3face
    // transfers still render in transfer history; see the note on the class.
    new Int3faceTransferStatusProvider(ChainList, network),
  ];

  instance = new TransferHistoryStore(
    () => {},
    makeIndexedKVStore(TRANSFER_HISTORY_STORE_KEY),
    transferStatusProviders,
    undefined,
    isBrowser
  );
  return instance;
}

/** Stable handle to the transfer history store, for imperative actions. */
export function useTransferHistoryStore(): TransferHistoryStore {
  return getTransferHistoryStore();
}

/** Reactive history rows (pending + resolved bridge transfers) for an account. */
export function useTransferHistoriesByAccount(accountAddress: string) {
  const transferHistoryStore = getTransferHistoryStore();
  const snapshots = useStore(
    transferHistoryStore.store,
    (state) => state.snapshots
  );
  return useMemo(
    () => transferHistoryStore.getHistoriesByAccount(accountAddress, snapshots),
    [transferHistoryStore, accountAddress, snapshots]
  );
}
