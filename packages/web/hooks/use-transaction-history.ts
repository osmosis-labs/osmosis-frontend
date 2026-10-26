import type { TxSnapshot } from "@osmosis-labs/bridge";
import { useEffect, useMemo } from "react";

import {
  useIndexedTransferHistories,
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

const UNKNOWN_SENDER_REFETCH_MS = 30_000;
const UNKNOWN_SENDER_MAX_REFETCHES = 10;

export const useTransactionHistory = ({
  pageSize = "100",
  pageNumber = "0",
  types,
}: {
  pageNumber?: string;
  pageSize?: string;
  /** Only these transaction types (filtered by the API); all by default. */
  types?: ("swap" | "deposit" | "withdraw")[];
} = {}) => {
  const { address, isWalletConnected } = useWallet();
  const transferHistoryStore = useTransferHistoryStore();
  const storedTransfers = useTransferHistoriesByAccount(address || "");

  const {
    data: transactionsData,
    isLoading,
    // Only a failed first load: a failed background refetch (e.g. the Axelar sender
    // poll) keeps the history already loaded.
    isLoadingError: isError,
  } = api.edge.transactions.getTransactions.useQuery(
    {
      address: address || "",
      page: pageNumber,
      pageSize,
      types,
    },
    {
      enabled: Boolean(isWalletConnected && address),
      // A failing transaction index takes about 15 s per request; retry once so the
      // load error shows after about 30 s instead of a minute of spinner.
      retry: 1,
      // An Axelar deposit's source sender comes from Axelarscan, which can
      // lag or time out; the server retries on the next request, so poll a
      // few times while any is still unknown.
      refetchInterval: (query) =>
        query.state.dataUpdateCount <= UNKNOWN_SENDER_MAX_REFETCHES &&
        query.state.data?.transfers.some(
          (t) =>
            t.direction === "deposit" &&
            t.fromChain.chainType === "evm" &&
            !t.fromAddress
        )
          ? UNKNOWN_SENDER_REFETCH_MS
          : false,
    }
  );

  // Transfers from the transaction index, so history includes transfers
  // made in other browsers or devices (local history is per browser).
  // The server shapes them as TxSnapshots; the store tracks their status.
  const indexedTransfers = transactionsData?.transfers as unknown as
    TxSnapshot[] | undefined;
  useEffect(() => {
    if (!indexedTransfers?.length) return;
    transferHistoryStore.importSnapshots(indexedTransfers);
  }, [indexedTransfers, transferHistoryStore]);

  // This page's indexed transfers, plus the ones made in this browser (which
  // may not be indexed yet). Imported transfers only show on their own page.
  const pageTransfers = useIndexedTransferHistories(
    address || "",
    indexedTransfers
  );
  const recentTransfers = useMemo(
    () => [...storedTransfers.filter((t) => !t.imported), ...pageTransfers],
    [storedTransfers, pageTransfers]
  );

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
    /** True when the indexed history couldn't be loaded; only this browser's transfers are shown. */
    isError,
  };
};
