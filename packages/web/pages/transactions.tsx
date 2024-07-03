import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import { TransactionContent } from "~/components/transactions/transaction-content";
import { TransactionDetailsModal } from "~/components/transactions/transaction-details/transaction-details-modal";
import { TransactionDetailsSlideover } from "~/components/transactions/transaction-details/transaction-details-slideover";
import { EventName } from "~/config";
import { useFeatureFlags, useNavBar } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

// @ts-ignore
const EXAMPLE = {
  ADDRESS: "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3",
};

const Transactions: React.FC = observer(() => {
  const { transactionsPage, _isInitialized } = useFeatureFlags();

  const router = useRouter();
  const {
    page = "0",
    pageSize = "100",
    address: addressFromQuery,
  } = router.query;

  // page=0&page=1 will return [0, 1] from router.query, check if type is string or array and return first element if array
  const pageString = Array.isArray(page) ? page[0] : page;
  const pageSizeString = Array.isArray(pageSize) ? pageSize[0] : pageSize;
  const addressFromQueryString = Array.isArray(addressFromQuery)
    ? addressFromQuery[0]
    : addressFromQuery;

  const { accountStore, chainStore } = useStore();
  const osmosisChainId = chainStore.osmosis.chainId;
  const wallet = accountStore.getWallet(osmosisChainId);
  // for easy testing, pass in an optional address query string to override connected address
  // /transactions?page=0&address=osmoADDRESS
  const address = addressFromQueryString || wallet?.address || "";

  console.log("address: ", address);

  const isWalletConnected = Boolean(wallet?.isWalletConnected);

  const { isLoading: isWalletLoading } = useWalletSelect();

  const { data, isFetching: isGetTransactionsFetching } =
    api.edge.transactions.getTransactions.useQuery(
      {
        // address: EXAMPLE.ADDRESS,
        address,
        page: pageString,
        pageSize: pageSizeString,
      },
      {
        enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
      }
    );

  const { transactions, hasNextPage } = data ?? {
    transactions: [],
    hasNextPage: false,
  };

  useEffect(() => {
    if (!transactionsPage && _isInitialized) {
      router.push("/");
    }
  }, [transactionsPage, router, _isInitialized]);

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.TransactionsPage.pageViewed],
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

  const [selectedTransactionHash, setSelectedTransactionHash] = useState<
    string | undefined
  >(undefined);

  const [open, setOpen] = useState(false);

  const { isLargeDesktop } = useWindowSize();

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
    () => transactions.find((tx) => tx.hash === selectedTransactionHash),
    [transactions, selectedTransactionHash]
  );

  return (
    <main className="mx-auto flex max-w-7xl px-16 lg:px-8 md:px-4">
      <TransactionContent
        setSelectedTransactionHash={setSelectedTransactionHash}
        selectedTransactionHash={selectedTransactionHash}
        transactions={transactions}
        setOpen={setOpen}
        open={open}
        address={address}
        isLoading={isGetTransactionsFetching || isWalletLoading}
        isWalletConnected={isWalletConnected}
        page={pageString}
        hasNextPage={hasNextPage}
        wallet={wallet}
      />
      {isLargeDesktop ? (
        <TransactionDetailsSlideover
          onRequestClose={onRequestClose}
          open={open}
          transaction={selectedTransaction}
        />
      ) : (
        <TransactionDetailsModal
          onRequestClose={onRequestClose}
          isOpen={open}
          transaction={selectedTransaction}
        />
      )}
    </main>
  );
});

export default Transactions;
