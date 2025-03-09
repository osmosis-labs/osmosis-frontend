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
  limit = 20,
}: {
  limit?: number;
} = {}) => {
  const { currentWallet } = useWallets();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = api.local.transactions.getTransactionsInfinite.useInfiniteQuery(
    {
      address: currentWallet?.address || "",
      limit,
    },
    {
      enabled: Boolean(currentWallet?.address),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Flatten all pages of transactions into a single array
  const allTransactions = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data]
  );

  const mergedActivity = useMemo(
    () => [
      ...allTransactions.map((tx) => ({
        ...tx,
        __type: "transaction" as const,
        compareDate: new Date(tx.blockTimestamp),
      })),
    ],
    [allTransactions]
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
    hasNextPage: Boolean(hasNextPage),
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  };
};
