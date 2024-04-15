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
import { useTranslation, useWindowSize } from "~/hooks";
import { useFeatureFlags, useNavBar } from "~/hooks";

const Transactions: React.FC = () => {
  const { transactionsPage, _isInitialized } = useFeatureFlags();
  const router = useRouter();

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

  const [open, setOpen] = useState(false);

  const { isLargeDesktop } = useWindowSize();

  useEffect(() => {
    // edge case - Close the slide over when the screen size changes to large desktop, reduces bugginess with transition
    setOpen(false);
  }, [isLargeDesktop]);

  return (
    <main className="relative mx-16 flex gap-4">
      <TransactionContent open={open} setOpen={setOpen} />
      {isLargeDesktop ? (
        <TransactionDetailsSlideover
          onRequestClose={() => setOpen(false)}
          open={open}
        />
      ) : (
        <TransactionDetailsModal
          onRequestClose={() => setOpen(false)}
          isOpen={open}
        />
      )}
      <BackToTopButton />
    </main>
  );
};

export default Transactions;
