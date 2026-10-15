import type { TxSnapshot } from "@osmosis-labs/bridge";
import { useEffect, useMemo } from "react";

import {
  useTransferHistoriesByAccount,
  useTransferHistoryStore,
} from "~/stores/transfer-history-instance";
import { api } from "~/utils/trpc";

import { useWallet } from "./use-wallet";

export type HistoryTransaction = ReturnType<
  typeof useTransactionHistory
>["transactions"][number];

export type HistorySwapTransaction = Extract<
  HistoryTransaction,
  { __type: "transaction" }
>;
export type HistoryBridgeTransaction = Extract<
  HistoryTransaction,
  { __type: "recentTransfer" }
>;

export const useTransactionHistory = ({
  pageSize = "100",
  pageNumber = "0",
}: {
  pageNumber?: string;
  pageSize?: string;
} = {}) => {
  const { address, isWalletConnected } = useWallet();
  const transferHistoryStore = useTransferHistoryStore();
  const recentTransfers = useTransferHistoriesByAccount(address || "");

  const { data: transactionsData, isLoading } =
    api.edge.transactions.getTransactions.useQuery(
      {
        address: address || "",
        page: pageNumber,
        pageSize,
      },
      {
        enabled: Boolean(isWalletConnected && address),
      }
    );

  // Transfers from the transaction index, so history includes transfers
  // made in other browsers or devices (local history is per browser).
  // The server shapes them as TxSnapshots; the store dedupes and tracks them.
  const indexedTransfers = transactionsData?.transfers;
  useEffect(() => {
    if (!indexedTransfers?.length) return;
    transferHistoryStore.importSnapshots(
      indexedTransfers as unknown as TxSnapshot[]
    );
  }, [indexedTransfers, transferHistoryStore]);

  const { transactions, hasNextPage } = useMemo(
    () =>
      transactionsData ?? {
        transactions: [],
        hasNextPage: false,
      },
    [transactionsData]
  );

  const mergedActivity = useMemo(
    () => [
      ...transactions.map((tx) => ({
        ...tx,
        __type: "transaction" as const,
        compareDate: new Date(tx.blockTimestamp),
      })),
      ...recentTransfers.map((transfer) => ({
        ...transfer,
        __type: "recentTransfer" as const,
        compareDate: transfer.createdAt,
      })),
    ],
    [transactions, recentTransfers]
  );

  const sortedActivity = useMemo(
    () =>
      mergedActivity.sort(
        (a, b) => b.compareDate.getTime() - a.compareDate.getTime()
      ),
    [mergedActivity]
  );

  return {
    transactions: sortedActivity,
    hasNextPage,
    isLoading,
  };
};
