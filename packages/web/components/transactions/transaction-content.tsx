import { FormattedTransaction } from "@osmosis-labs/server";
import { useRouter } from "next/router";

import { BackToTopButton } from "~/components/buttons/back-to-top-button";
import { Spinner } from "~/components/loaders";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { TransactionButtons } from "~/components/transactions/transaction-buttons";
import { TransactionsPaginaton } from "~/components/transactions/transaction-pagination";
import { TransactionRow } from "~/components/transactions/transaction-row";
import {
  groupTransactionsByDate,
  useFormatDate,
} from "~/components/transactions/transaction-utils";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";

export const TransactionContent = ({
  setSelectedTransaction,
  transactions = [],
  setOpen,
  open,
  address,
  isLoading,
  isWalletConnected,
  page,
  hasNextPage,
}: {
  setSelectedTransaction: (selectedTransaction: FormattedTransaction) => void;
  transactions?: FormattedTransaction[];
  setOpen: (open: boolean) => void;
  open: boolean;
  address: string;
  isLoading: boolean;
  isWalletConnected: boolean;
  page: string;
  hasNextPage: boolean;
}) => {
  const { logEvent } = useAmplitudeAnalytics();

  const { t } = useTranslation();

  const formatDate = useFormatDate();

  const showPagination = isWalletConnected && !isLoading;

  const router = useRouter();

  return (
    <div className="flex w-full flex-col pb-16">
      <div className="flex w-full justify-between pt-8 pb-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-h3 md:text-h5">{t("transactions.title")}</h1>
          <p className="body2 text-osmoverse-200 opacity-50">
            Currently only trade history is displayed. Support for more
            transaction types coming soon.
          </p>
        </div>
        <TransactionButtons open={open} address={address} />
      </div>

      <div className="-mx-4 flex flex-col">
        {!isWalletConnected ? (
          <NoTransactionsSplash variant="connect" />
        ) : isLoading ? (
          <Spinner className="self-center" />
        ) : transactions.length === 0 ? (
          <NoTransactionsSplash variant="transactions" />
        ) : (
          Object.entries(groupTransactionsByDate(transactions)).map(
            ([date, transactions]) => (
              <div key={date} className="flex flex-col px-4 pt-8">
                <div className="subtitle1 md:body2 pb-3 capitalize text-osmoverse-300">
                  {formatDate(date)}
                </div>
                <hr className="mb-3 text-osmoverse-700" />
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    title={{
                      // each type of transaction would have a translation for when it's pending, successful, or failed
                      pending: t("transactions.swapping"),
                      success: t("transactions.swapped"),
                      failed: t("transactions.swapFailed"),
                    }}
                    effect="swap"
                    status={transaction.code === 0 ? "success" : "failed"}
                    onClick={() => {
                      // TODO - once there are more transaction types, we can add more event names
                      logEvent([
                        EventName.TransactionsPage.swapClicked,
                        {
                          tokenIn:
                            transaction.metadata[0].value[0].txInfo.tokenIn
                              .token.denom,
                          tokenOut:
                            transaction.metadata[0].value[0].txInfo.tokenOut
                              .token.denom,
                        },
                      ]);

                      setSelectedTransaction(transaction);

                      // delay to ensure the slide over transitions smoothly
                      if (!open) {
                        setTimeout(() => setOpen(true), 1);
                      }
                    }}
                    tokenConversion={{
                      tokenIn: {
                        amount:
                          transaction.metadata[0].value[0].txInfo.tokenIn.token,
                        value:
                          transaction.metadata[0].value[0].txInfo.tokenIn.usd,
                      },
                      tokenOut: {
                        amount:
                          transaction.metadata[0].value[0].txInfo.tokenOut
                            .token,
                        value:
                          transaction.metadata[0].value[0].txInfo.tokenOut.usd,
                      },
                    }}
                  />
                ))}
              </div>
            )
          )
        )}
      </div>

      <div className="py-6">
        {showPagination && (
          <TransactionsPaginaton
            showPrevious={+page > 0}
            showNext={hasNextPage}
            previousHref={{
              pathname: router.pathname,
              query: { ...router.query, page: Math.max(0, +page - 1) },
            }}
            nextHref={{
              pathname: router.pathname,
              query: { ...router.query, page: +page + 1 },
            }}
          />
        )}
      </div>
      <BackToTopButton />
    </div>
  );
};
