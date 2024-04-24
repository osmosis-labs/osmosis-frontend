import { FormattedTransaction } from "@osmosis-labs/server";
import { observer } from "mobx-react-lite";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { EventName } from "~/config";
import { useFeatureFlags, useNavBar } from "~/hooks";
import { useAmplitudeAnalytics, useTranslation, useWindowSize } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

const EXAMPLE = {
  ADDRESS: "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3",
  PAGE: 1,
  PAGE_SIZE: 100,
};

const Transactions: React.FC = observer(() => {
  const { transactionsPage, _isInitialized } = useFeatureFlags();

  const router = useRouter();
  const { page = "1", pageSize = "100" } = router.query;
  const currentPage = parseInt(page.toString());
  const currentPageSize = parseInt(pageSize.toString());

  const { accountStore, chainStore } = useStore();

  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address || "";

  const isWalletConnected = Boolean(account?.isWalletConnected);

  const { data: transactionData, isLoading } =
    api.edge.transactions.getTransactions.useQuery(
      {
        // address,
        address: EXAMPLE.ADDRESS,
        // page: EXAMPLE.PAGE,
        page: currentPage,
        pageSize: currentPageSize,
      },
      {
        enabled: !!address,
      }
    );

  useEffect(() => {
    if (!transactionsPage && _isInitialized) {
      router.push("/");
    }
  }, [transactionsPage, router, _isInitialized]);

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Stake.pageViewed],
  });

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

  const [selectedTransaction, setSelectedTransaction] =
    useState<FormattedTransaction | null>(null);

  const [open, setOpen] = useState(false);

  const { isLargeDesktop } = useWindowSize();

  useEffect(() => {
    // edge case - Close the slide over when the screen size changes to large desktop, reduces bugginess with transition
    setOpen(false);
  }, [isLargeDesktop]);

  const showPagination = isWalletConnected && !isLoading;

  return (
    <main className="relative mx-16 flex flex-col gap-4">
      <TransactionContent
        setSelectedTransaction={setSelectedTransaction}
        transactions={transactionData}
        setOpen={setOpen}
        open={open}
        address={address}
        isLoading={isLoading}
        isWalletConnected={isWalletConnected}
      />
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
      <div className="pt-4 pb-20">
        {showPagination && (
          <TransactionsPaginaton
            showPrevious={currentPage > 1}
            showNext={
              transactionData !== undefined && transactionData?.length > 0
            }
            previousHref={`?page=${Math.max(1, currentPage - 1)}`}
            nextHref={`?page=${currentPage + 1}`}
          />
        )}
      </div>
      <BackToTopButton />
    </main>
  );
});

const TransactionsPaginaton = ({
  showPrevious,
  showNext,
  previousHref,
  nextHref,
}: {
  showPrevious: boolean;
  showNext: boolean;
  previousHref: string;
  nextHref: string;
}) => {
  return (
    <Pagination>
      <PaginationContent>
        {showPrevious && (
          <PaginationItem>
            <PaginationPrevious href={previousHref} />
          </PaginationItem>
        )}
        {showNext && (
          <PaginationItem>
            <PaginationNext href={nextHref} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default Transactions;
