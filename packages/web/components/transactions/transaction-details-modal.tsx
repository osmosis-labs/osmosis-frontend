import { FunctionComponent } from "react";

import { TransactionDetailsItem } from "~/components/transactions/transaction-details/transaction-details-item";
import { useTransactionHistory } from "~/hooks/use-transaction-history";
import { ModalBase, ModalBaseProps } from "~/modals/base";

export const TransactionDetailsModal: FunctionComponent<
  ModalBaseProps & {
    transaction?: ReturnType<
      typeof useTransactionHistory
    >["transactions"][number];
  }
> = ({ onRequestClose, isOpen, transaction }) => {
  if (!transaction) return null;
  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-w-[32.25rem] !bg-osmoverse-850 xl:!bg-osmoverse-850 sm:h-full sm:max-h-[100vh] sm:!rounded-none sm:py-0 sm:pt-2" // 516px
    >
      <TransactionDetailsItem
        transaction={transaction}
        onRequestClose={onRequestClose}
        isModal
      />
    </ModalBase>
  );
};
