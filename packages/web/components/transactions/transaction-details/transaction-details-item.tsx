import { TransactionSwapDetails } from "~/components/transactions/transaction-details/transaction-swap-details";
import { TransactionTransferDetails } from "~/components/transactions/transaction-details/transaction-transfer-details";
import { HistoryTransaction } from "~/hooks/use-transaction-history";

interface TransactionDetailsItemProps {
  transaction: HistoryTransaction;
  onRequestClose: () => void;
  isModal?: boolean;
}

export const TransactionDetailsItem = ({
  transaction,
  onRequestClose,
  isModal = false,
}: TransactionDetailsItemProps) => {
  return (
    <>
      {transaction.__type === "transaction" && (
        <TransactionSwapDetails
          onRequestClose={onRequestClose}
          isModal={isModal}
          transaction={transaction}
        />
      )}
      {transaction.__type === "recentTransfer" && (
        <TransactionTransferDetails
          onRequestClose={onRequestClose}
          isModal={isModal}
          transaction={transaction}
        />
      )}
    </>
  );
};
