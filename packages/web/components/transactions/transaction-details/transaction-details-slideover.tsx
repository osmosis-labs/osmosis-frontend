import { Transition } from "@headlessui/react";

import { TransactionDetailsContent } from "~/components/transactions/transaction-details/transaction-details-content";
import { useTransactionHistory } from "~/hooks/use-transactions";

export const TransactionDetailsSlideover = ({
  onRequestClose,
  open,
  transaction,
}: {
  onRequestClose: () => void;
  open: boolean;
  transaction?: ReturnType<typeof useTransactionHistory>["transactions"];
}) => {
  if (!transaction) return null;
  return (
    <Transition
      show={open}
      enter="transition-all ease-out duration-300"
      enterFrom="w-0 opacity-0"
      enterTo="w-[512px] opacity-100"
      leave="transition-all ease-out duration-300"
      leaveFrom="w-[512px] opacity-100"
      leaveTo="w-0 opacity-0"
    >
      <div>
        <TransactionDetailsContent
          onRequestClose={onRequestClose}
          isModal={false}
          transaction={transaction}
        />
      </div>
    </Transition>
  );
};
