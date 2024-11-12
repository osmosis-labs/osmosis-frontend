import { Transition } from "@headlessui/react";

import { TransactionDetailsItem } from "~/components/transactions/transaction-details/transaction-details-item";
import { useTransactionHistory } from "~/hooks/use-transaction-history";

export const TransactionDetailsSlideover = ({
  onRequestClose,
  open,
  transaction,
}: {
  onRequestClose: () => void;
  open: boolean;
  transaction?: ReturnType<
    typeof useTransactionHistory
  >["transactions"][number];
}) => {
  if (!transaction) return null;
  return (
    <Transition
      show={open}
      as="div"
      enter="transition-all ease-out duration-300"
      enterFrom="w-0 opacity-0"
      enterTo="w-[512px] opacity-100"
      leave="transition-all ease-out duration-300"
      leaveFrom="w-[512px] opacity-100"
      leaveTo="w-0 opacity-0"
    >
      <TransactionDetailsItem
        transaction={transaction}
        onRequestClose={onRequestClose}
      />
    </Transition>
  );
};
