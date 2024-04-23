import { FormattedTransaction } from "@osmosis-labs/server";

import { Spinner } from "~/components/loaders";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { TransactionButtons } from "~/components/transactions/transaction-buttons";
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
}: {
  setSelectedTransaction: (selectedTransaction: FormattedTransaction) => void;
  transactions?: FormattedTransaction[];
  setOpen: (open: boolean) => void;
  open: boolean;
  address: string;
  isLoading: boolean;
  isWalletConnected: boolean;
}) => {
  const { logEvent } = useAmplitudeAnalytics();

  const { t } = useTranslation();

  const formatDate = useFormatDate();

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full justify-between pt-8 pb-4">
        <h1 className="text-h3 font-h3">{t("transactions.title")}</h1>
        <TransactionButtons open={open} address={address} />
      </div>

      <div className="flex flex-col">
        {!isWalletConnected ? (
          <NoTransactionsSplash variant="connect" />
        ) : isLoading ? (
          <Spinner className="self-center" />
        ) : transactions.length === 0 ? (
          <NoTransactionsSplash variant="transactions" />
        ) : (
          Object.entries(groupTransactionsByDate(transactions)).map(
            ([date, transactions]) => (
              <div key={date} className="flex flex-col gap-4 px-4 pt-8 pb-3">
                <div className="text-osmoverse-300">{formatDate(date)}</div>
                <hr className="text-osmoverse-700" />
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
    </div>
  );
};
