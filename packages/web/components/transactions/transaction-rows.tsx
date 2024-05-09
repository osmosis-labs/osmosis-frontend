import { FormattedTransaction } from "@osmosis-labs/server";

import { TransactionRow } from "~/components/transactions/transaction-row";
import {
  groupTransactionsByDate,
  useFormatDate,
} from "~/components/transactions/transaction-utils";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";

export const TransactionRows = ({
  transactions,
  selectedTransaction,
  setSelectedTransaction,
  setOpen,
  open,
}: {
  transactions: FormattedTransaction[];
  selectedTransaction?: FormattedTransaction;
  setSelectedTransaction: (selectedTransaction: FormattedTransaction) => void;
  setOpen: (open: boolean) => void;
  open: boolean;
}) => {
  const formatDate = useFormatDate();
  const { logEvent } = useAmplitudeAnalytics();
  const { t } = useTranslation();

  return (
    <>
      {Object.entries(groupTransactionsByDate(transactions)).map(
        ([date, transactions]) => (
          <div key={date} className="flex flex-col px-4 pt-8">
            <div className="subtitle1 md:body2 pb-3 capitalize text-osmoverse-300">
              {formatDate(date)}
            </div>
            <hr className="mb-3 text-osmoverse-700" />
            {transactions
              .map((transaction) => {
                return (
                  <TransactionRow
                    key={transaction.id}
                    hash={transaction.hash}
                    selectedTransaction={selectedTransaction}
                    title={{
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
                          transaction?.metadata?.[0]?.value?.[0]?.txInfo
                            ?.tokenIn?.token,
                        value:
                          transaction?.metadata?.[0]?.value?.[0]?.txInfo
                            ?.tokenIn?.usd,
                      },
                      tokenOut: {
                        amount:
                          transaction?.metadata?.[0]?.value?.[0]?.txInfo
                            ?.tokenOut?.token,

                        value:
                          transaction.metadata[0].value[0].txInfo.tokenOut.usd,
                      },
                    }}
                  />
                );
              })
              // filters out any transactions with missing metadata
              .filter(Boolean)}
          </div>
        )
      )}
    </>
  );
};
