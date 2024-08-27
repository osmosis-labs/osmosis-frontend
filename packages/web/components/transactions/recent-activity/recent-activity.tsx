import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { SwapRow } from "./recent-activity-transaction-row";

const ACTIVITY_LIMIT = 5;

const RecentActivitySkeleton = () => {
  return (
    <>
      {Array.from({ length: ACTIVITY_LIMIT }).map((_, index) => (
        <div key={index} className="-mx-2 flex justify-between gap-4 p-2">
          <Skeleton className="h-9 w-1/3 " />
          <Skeleton className="h-9 w-1/5" />
        </div>
      ))}
    </>
  );
};

// v1 includes top 5 transactions from transaction history
export const RecentActivity: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const { t } = useTranslation();

  const { data: transactionsData, isLoading: isGetTransactionsLoading } =
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

  const { transactions } = transactionsData ?? {
    transactions: [],
  };

  const topActivity = transactions.slice(0, ACTIVITY_LIMIT);

  return (
    <div className="flex w-full flex-col py-3">
      <div className="flex cursor-pointer items-center justify-between gap-3">
        <h6 className="py-3">{t("portfolio.recentActivity")}</h6>
        <LinkButton
          href="/transactions"
          className="-mx-2 text-osmoverse-400"
          label={t("portfolio.seeAll")}
          ariaLabel={t("portfolio.seeAll")}
          size="md"
        />
      </div>
      <div className="flex flex-col justify-between self-stretch py-2">
        {isGetTransactionsLoading ? (
          <RecentActivitySkeleton />
        ) : topActivity?.length === 0 ? (
          <NoTransactionsSplash variant="transactions" />
        ) : (
          topActivity.map((activity) => {
            return (
              <SwapRow
                key={activity.id}
                title={{
                  pending: t("transactions.swapping"),
                  success: t("transactions.swapped"),
                  failed: t("transactions.swapFailed"),
                }}
                effect="swap"
                status={activity.code === 0 ? "success" : "failed"}
                tokenConversion={{
                  tokenIn: {
                    amount:
                      activity?.metadata?.[0]?.value?.[0]?.txInfo?.tokenIn
                        ?.token,
                    value:
                      activity?.metadata?.[0]?.value?.[0]?.txInfo?.tokenIn?.usd,
                  },
                  tokenOut: {
                    amount:
                      activity?.metadata?.[0]?.value?.[0]?.txInfo?.tokenOut
                        ?.token,

                    value: activity.metadata[0].value[0].txInfo.tokenOut.usd,
                  },
                }}
                hash={""}
              />
            );
          })
        )}
      </div>
    </div>
  );
});
