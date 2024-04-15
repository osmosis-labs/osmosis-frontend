import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { BackToTopButton } from "~/components/buttons/back-to-top-button";
import LinkButton from "~/components/buttons/link-button";
import { TransactionContent } from "~/components/transactions/transaction-content";
import {
  TransactionDetailsModal,
  TransactionDetailsSlideover,
} from "~/components/transactions/transaction-details";
import { useGetTransactions, useTranslation, useWindowSize } from "~/hooks";
import { useFeatureFlags, useNavBar } from "~/hooks";
import { useStore } from "~/stores";

const Transactions: React.FC = () => {
  const { transactionsPage, _isInitialized } = useFeatureFlags();
  const router = useRouter();

  const { accountStore, chainStore } = useStore();

  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address || "";

  const { data: transactionData, isLoading } = useGetTransactions(address);

  useEffect(() => {
    if (!transactionsPage && _isInitialized) {
      router.push("/");
    }
  }, [transactionsPage, router, _isInitialized]);

  const { t } = useTranslation();

  useNavBar({
    title: (
      <LinkButton
        className="mr-auto md:invisible"
        icon={
          <Image
            alt="left"
            src="/icons/arrow-left.svg"
            width={24}
            height={24}
            className="text-osmoverse-200"
          />
        }
        label={t("menu.portfolio")}
        ariaLabel={t("menu.portfolio")}
        href="/portfolio"
      />
    ),
    ctas: [],
  });

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const { isLargeDesktop } = useWindowSize();

  useEffect(() => {
    // edge case - Close the slide over when the screen size changes to large desktop, reduces bugginess with transition
    setOpen(false);
  }, [isLargeDesktop]);

  return (
    <main className="relative mx-16 flex gap-4">
      {!isLoading && transactionData && (
        // TODO - add loading state
        <>
          <TransactionContent
            setSelectedTransaction={setSelectedTransaction}
            transactions={transactionData}
            setOpen={setOpen}
            open={open}
          />
        </>
      )}
      {isLargeDesktop ? (
        <TransactionDetailsSlideover
          onRequestClose={() => setOpen(false)}
          open={open}
          transaction={selectedTransaction}
        />
      ) : (
        <TransactionDetailsModal
          onRequestClose={() => setOpen(false)}
          isOpen={open}
          transaction={selectedTransaction}
        />
      )}
      <BackToTopButton />
    </main>
  );
};

export default Transactions;
