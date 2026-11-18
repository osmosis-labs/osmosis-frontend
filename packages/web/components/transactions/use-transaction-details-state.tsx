import { useMemo, useState } from "react";

import { useWindowSize } from "~/hooks";
import { HistoryTransaction } from "~/hooks/use-transaction-history";
import { transferKey } from "~/stores/transfer-history";

export const useTransactionModal = ({
  transactions,
}: {
  transactions: HistoryTransaction[];
}) => {
  // The slideover needs room for the sidebar, the page content and itself, which
  // only fits from about 1715px, so it starts at xxxl (1792px). Below that, the
  // details open in a modal.
  const { isExtraLargeDesktop: showSlideover } = useWindowSize();
  const [open, setOpen] = useState(false);
  const [selectedTransactionHash, setSelectedTransactionHash] = useState<
    string | undefined
  >(undefined);

  // edge case - Close the slide over when the screen size crosses the slideover breakpoint, reduces bugginess with transition
  const [prevShowSlideover, setPrevShowSlideover] = useState(showSlideover);
  if (showSlideover !== prevShowSlideover) {
    setPrevShowSlideover(showSlideover);
    setOpen(false);
  }

  const onRequestClose = () => {
    setOpen(false);
    // add delay for smoother transition
    setTimeout(() => setSelectedTransactionHash(undefined), 300);
  };

  const selectedTransaction = useMemo(
    () =>
      transactions.find(
        (tx) =>
          (tx.__type === "recentTransfer" ? transferKey(tx) : tx.hash) ===
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
    showSlideover,
  };
};
