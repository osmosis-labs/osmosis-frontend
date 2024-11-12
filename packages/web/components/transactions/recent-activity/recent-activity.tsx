import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { TransactionSwapRow } from "~/components/transactions/transaction-types/transaction-swap-row";
import { TransactionTransferRow } from "~/components/transactions/transaction-types/transaction-transfer-row";
import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation } from "~/hooks";
import { useTransactionHistory } from "~/hooks/use-transaction-history";

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
  const { t } = useTranslation();

  const { transactions, isLoading } = useTransactionHistory();

  const showNoTransactionsSplash = transactions.length === 0;

  const topTransactions = transactions.slice(0, ACTIVITY_LIMIT);

  return (
    <div className="flex w-full flex-col py-3">
      <div className="flex items-center justify-between gap-3">
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
        {isLoading ? (
          <RecentActivitySkeleton />
        ) : showNoTransactionsSplash ? (
          <NoTransactionsSplash variant="transactions" />
        ) : (
          topTransactions.map((transaction) => {
            if (transaction.__type === "transaction") {
              return (
                <TransactionSwapRow
                  key={transaction.hash}
                  size="sm"
                  transaction={{
                    code: transaction.code,
                    tokenIn: {
                      amount:
                        transaction?.metadata?.[0]?.value?.[0]?.txInfo?.tokenIn
                          ?.token,
                      value:
                        transaction?.metadata?.[0]?.value?.[0]?.txInfo?.tokenIn
                          ?.usd,
                    },
                    tokenOut: {
                      amount:
                        transaction?.metadata?.[0]?.value?.[0]?.txInfo?.tokenOut
                          ?.token,

                      value:
                        transaction.metadata[0].value[0].txInfo.tokenOut.usd,
                    },
                  }}
                />
              );
            }

            if (transaction.__type === "recentTransfer") {
              return (
                <TransactionTransferRow
                  key={transaction.sendTxHash}
                  size="sm"
                  transaction={transaction}
                />
              );
            }

            return null;
          })
        )}
      </div>
    </div>
  );
});
