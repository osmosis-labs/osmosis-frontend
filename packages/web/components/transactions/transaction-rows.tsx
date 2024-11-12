import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

import { TransactionSwapRow } from "~/components/transactions/transaction-types/transaction-swap-row";
import { TransactionTransferRow } from "~/components/transactions/transaction-types/transaction-transfer-row";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { HistoryTransaction } from "~/hooks/use-transaction-history";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const formatDate = (
  t: ReturnType<typeof useTranslation>["t"],
  dateString: string
) => {
  const date = dayjs(dateString);
  if (date.isToday()) return t("date.earlierToday");
  if (date.isYesterday()) return t("date.yesterday");

  const month = date.format("MMMM");

  if (date.isSame(dayjs(), "year")) return `${month} ${date.format("D")}`;

  return `${month} ${date.format("D, YYYY")}`;
};

const groupTransactionsByDate = (
  transactions: HistoryTransaction[]
): Record<string, HistoryTransaction[]> => {
  return transactions.reduce((acc, transaction) => {
    // extract date from block timestamp
    const date = dayjs(
      transaction.__type === "recentTransfer"
        ? transaction.compareDate
        : transaction.blockTimestamp
    ).format("YYYY-MM-DD");

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(transaction);

    return acc;
  }, {} as Record<string, HistoryTransaction[]>);
};

export const TransactionRows = ({
  transactions,
  selectedTransactionHash,
  setSelectedTransactionHash,
  setOpen,
  open,
}: {
  transactions: HistoryTransaction[];
  selectedTransactionHash?: string;
  setSelectedTransactionHash: (hash: string) => void;
  setOpen: (open: boolean) => void;
  open: boolean;
}) => {
  const { logEvent } = useAmplitudeAnalytics();
  const { t } = useTranslation();

  return (
    <>
      {Object.entries(groupTransactionsByDate(transactions)).map(
        ([date, transactions]) => (
          <div key={date} className="flex flex-col px-4 pt-8">
            <div className="subtitle1 md:body2 pb-3 capitalize text-osmoverse-300">
              {formatDate(t, date)}
            </div>
            <hr className="mb-3 text-osmoverse-700" />
            {transactions
              .map((transaction) => {
                if (transaction.__type === "transaction") {
                  const isSelected =
                    selectedTransactionHash === transaction.hash;
                  return (
                    <TransactionSwapRow
                      key={transaction.hash}
                      hash={transaction.hash}
                      isSelected={isSelected}
                      size="lg"
                      transaction={{
                        code: transaction.code,
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
                            transaction.metadata[0].value[0].txInfo.tokenOut
                              .usd,
                        },
                      }}
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

                        setSelectedTransactionHash(transaction.hash);

                        // delay to ensure the slide over transitions smoothly
                        if (!open) {
                          setTimeout(() => setOpen(true), 1);
                        }
                      }}
                    />
                  );
                }

                if (transaction.__type === "recentTransfer") {
                  const isSelected =
                    selectedTransactionHash === transaction.sendTxHash;
                  return (
                    <TransactionTransferRow
                      key={transaction.sendTxHash}
                      size="lg"
                      transaction={transaction}
                      onClick={() => {
                        // TODO - once there are more transaction types, we can add more event names
                        // logEvent([
                        //   EventName.TransactionsPage.swapClicked,
                        //   {
                        //     tokenIn:
                        //       transaction.metadata[0].value[0].txInfo.tokenIn
                        //         .token.denom,
                        //     tokenOut:
                        //       transaction.metadata[0].value[0].txInfo.tokenOut
                        //         .token.denom,
                        //   },
                        // ]);

                        setSelectedTransactionHash(transaction.sendTxHash);

                        // delay to ensure the slide over transitions smoothly
                        if (!open) {
                          setTimeout(() => setOpen(true), 1);
                        }
                      }}
                      hash={transaction.sendTxHash}
                      isSelected={isSelected}
                    />
                  );
                }

                return null;
              })
              // filters out any transactions with missing metadata
              .filter(Boolean)}
          </div>
        )
      )}
    </>
  );
};
