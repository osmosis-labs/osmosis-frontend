import { useMemo } from "react";

import { useWallets } from "~/hooks/use-wallets";
import { api } from "~/utils/trpc";

export type HistoryTransaction = ReturnType<
  typeof useTransactionHistory
>["transactions"][number];

export type HistorySwapTransaction = Extract<
  HistoryTransaction,
  { __type: "transaction" }
>;

export const useTransactionHistory = ({
  pageSize = "100",
  pageNumber = "0",
}: {
  pageNumber?: string;
  pageSize?: string;
} = {}) => {
  const { currentWallet } = useWallets();

  const { data: transactionsData, isLoading } =
    api.local.transactions.getTransactions.useQuery(
      {
        address: currentWallet?.address || "",
        page: pageNumber,
        pageSize,
      },
      {
        enabled: Boolean(currentWallet?.address),
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

  const mergedActivity = useMemo(
    () => [
      ...transactions.map((tx: any) => ({
        ...tx,
        __type: "transaction" as const,
        compareDate: new Date(tx.blockTimestamp),
      })),
    ],
    [transactions]
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
