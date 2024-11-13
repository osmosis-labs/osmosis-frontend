import { useEffect, useMemo, useState } from "react";

import { useWindowSize } from "~/hooks";
import { HistoryTransaction } from "~/hooks/use-transaction-history";

export const useTransactionModal = ({
  transactions,
}: {
  transactions: HistoryTransaction[];
}) => {
  const { isLargeDesktop } = useWindowSize();
  const [open, setOpen] = useState(false);
  const [selectedTransactionHash, setSelectedTransactionHash] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    // edge case - Close the slide over when the screen size changes to large desktop, reduces bugginess with transition
    setOpen(false);
  }, [isLargeDesktop]);

  const onRequestClose = () => {
    setOpen(false);
    // add delay for smoother transition
    setTimeout(() => setSelectedTransactionHash(undefined), 300);
  };

  const selectedTransaction = useMemo(
    () =>
      transactions.find(
        (tx) =>
          (tx.__type === "recentTransfer" ? tx.sendTxHash : tx.hash) ===
          selectedTransactionHash
      ),
    [transactions, selectedTransactionHash]
  );

  return {
    open,
    setOpen,
    selectedTransactionHash,
    setSelectedTransactionHash,
    onRequestClose,
    selectedTransaction,
    isLargeDesktop,
  };
};
