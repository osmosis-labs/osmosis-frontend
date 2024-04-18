import { FormattedTransaction } from "@osmosis-labs/server";

import { TransactionRow } from "~/components/transactions/transaction-row";
import {
  formatDate,
  groupTransactionsByDate,
} from "~/components/transactions/transaction-utils";
import { Button } from "~/components/ui/button";

export const TransactionContent = ({
  setSelectedTransaction,
  transactions,
  setOpen,
  open,
}: {
  setSelectedTransaction: (selectedTransaction: FormattedTransaction) => void;
  transactions: FormattedTransaction[];
  setOpen: (open: boolean) => void;
  open: boolean;
}) => {
  // TODO - add loading state
  if (!transactions) return null;

  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full justify-between pb-4 pt-8">
        <h1 className="font-h3 text-h3">Transactions</h1>
        <div className="flex gap-3">
          <Button variant="secondary" size="md">
            Explorer &#x2197;
          </Button>
          <Button variant="secondary" size="md">
            Tax Reports &#x2197;
          </Button>
        </div>
      </div>

      <div>
        {Object.entries(groupedTransactions).map(([date, transactions]) => (
          <div key={date} className="flex flex-col gap-4 px-4 pb-3 pt-8">
            <div className="text-osmoverse-300">{formatDate(date)}</div>
            <hr className="text-osmoverse-700" />
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                title={{
                  // each type of transaction would have a translation for when it's pending, successful, or failed
                  pending: "Swapping",
                  success: "Swapped",
                  failed: "Swap failed",
                }}
                effect="swap"
                status={transaction.code === 0 ? "success" : "failed"}
                onClick={() => {
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
                    value: transaction.metadata[0].value[0].txInfo.tokenIn.usd,
                  },
                  tokenOut: {
                    amount:
                      transaction.metadata[0].value[0].txInfo.tokenOut.token,
                    value: transaction.metadata[0].value[0].txInfo.tokenOut.usd,
                  },
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
