import { FormattedTransaction } from "@osmosis-labs/server";
import { FunctionComponent } from "react";

import { TransactionDetailsContent } from "~/components/transactions/transaction-details/transaction-details-content";
import { ModalBase, ModalBaseProps } from "~/modals/base";

export const TransactionDetailsModal: FunctionComponent<
  ModalBaseProps & { transaction?: FormattedTransaction }
> = ({ onRequestClose, isOpen, transaction }) => {
  if (!transaction) return null;
  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-w-[32.25rem]" // 516px
    >
      <TransactionDetailsContent
        onRequestClose={onRequestClose}
        isModal={true}
        transaction={transaction}
      />
    </ModalBase>
  );
};
