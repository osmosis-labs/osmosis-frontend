import { FormattedTransaction } from "@osmosis-labs/server";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { SwapRow } from "./recent-activity-transaction-row";

type ActivityType = "transaction" | "recentTransfer";

interface MergedActivityMetadata {
  type: ActivityType;
  compareDate: Date;
  compareTxHash: string;
}

const ACTIVITY_LIMIT = 5;

const RecentActivitySkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex w-full justify-between">
          <Skeleton className="h-10 w-1/3 " />
          <Skeleton className="h-10 w-1/5" />
        </div>
      ))}
    </div>
  );
};

// v1 includes top 5 transactions from transaction history
export const RecentActivity: FunctionComponent = observer(() => {
  const { accountStore } = useStore();
  const { isLoading: isWalletLoading } = useWalletSelect();

  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const { t } = useTranslation();

  const { data: transactionsData, isFetching: isGetTransactionsFetching } =
    api.edge.transactions.getTransactions.useQuery(
      {
        address: wallet?.address || "",
        page: "0",
        pageSize: "100",
      },
      {
        enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
      }
    );

  const isLoading = isWalletLoading || isGetTransactionsFetching;

  const { transactions } = transactionsData ?? {
    transactions: [],
    hasNextPage: false,
  };

  const topActivity = transactions.slice(0, ACTIVITY_LIMIT);

  return (
    <div className="flex w-full flex-col">
      <div className="flex cursor-pointer items-center justify-between py-3">
        <h6>{t("portfolio.recentActivity")}</h6>
        <LinkButton
          href="/transactions"
          className="text-osmoverse-400"
          label={t("portfolio.seeAll")}
          ariaLabel={t("portfolio.seeAll")}
          size="md"
        />
      </div>
      <div className="flex w-full flex-col">
        {isLoading ? (
          <RecentActivitySkeleton />
        ) : topActivity?.length === 0 ? (
          <NoTransactionsSplash variant="transactions" />
        ) : (
          topActivity.map((activity) => {
            const recentTransactionActivity = activity as FormattedTransaction &
              MergedActivityMetadata;

            return (
              <SwapRow
                key={recentTransactionActivity.id}
                title={{
                  pending: t("transactions.swapping"),
                  success: t("transactions.swapped"),
                  failed: t("transactions.swapFailed"),
                }}
                effect="swap"
                status={
                  recentTransactionActivity.code === 0 ? "success" : "failed"
                }
                tokenConversion={{
                  tokenIn: {
                    amount:
                      recentTransactionActivity?.metadata?.[0]?.value?.[0]
                        ?.txInfo?.tokenIn?.token,
                    value:
                      recentTransactionActivity?.metadata?.[0]?.value?.[0]
                        ?.txInfo?.tokenIn?.usd,
                  },
                  tokenOut: {
                    amount:
                      recentTransactionActivity?.metadata?.[0]?.value?.[0]
                        ?.txInfo?.tokenOut?.token,

                    value:
                      recentTransactionActivity.metadata[0].value[0].txInfo
                        .tokenOut.usd,
                  },
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
});
