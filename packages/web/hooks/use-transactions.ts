import { useMemo } from "react";

import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useTransactionHistory = ({
  pageSize = "100",
  pageNumber = "0",
}: {
  pageNumber?: string;
  pageSize?: string;
} = {}) => {
  const { accountStore, transferHistoryStore } = useStore();

  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const recentTransfers = transferHistoryStore.getHistoriesByAccount(
    wallet?.address || ""
  );

  const { data: transactionsData, isLoading } =
    api.edge.transactions.getTransactions.useQuery(
      {
        address: wallet?.address || "",
        page: pageNumber,
        pageSize,
      },
      {
        enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
      }
    );

  const { transactions, hasNextPage } = useMemo(
    () =>
      transactionsData ?? {
        transactions: [],
        hasNextPage: false,
      },
    [transactionsData]
  );

  console.log(recentTransfers);

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
