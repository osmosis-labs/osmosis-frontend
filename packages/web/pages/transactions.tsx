import { FormattedTransaction } from "@osmosis-labs/server";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import LinkButton from "~/components/buttons/link-button";
import { TransactionContent } from "~/components/transactions/transaction-content";
import {
  TransactionDetailsModal,
  TransactionDetailsSlideover,
} from "~/components/transactions/transaction-details";
import { EventName } from "~/config";
import { useFeatureFlags, useNavBar } from "~/hooks";
import { useAmplitudeAnalytics, useTranslation, useWindowSize } from "~/hooks";
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
  const account = accountStore.getWallet(osmosisChainId);
  // for easy testing, pass in an optional address query string to override connected address
  // /transactions?page=0&address=osmoADDRESS
  const address = addressFromQueryString || account?.address || "";

  const isWalletConnected = Boolean(account?.isWalletConnected);

  const { data, isLoading } = api.edge.transactions.getTransactions.useQuery(
    {
      // address: EXAMPLE.ADDRESS,
      address,
      page: pageString,
      pageSize: pageSizeString,
    },
    {
      enabled: !!address,
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

  return (
    <main className="mx-auto flex max-w-7xl gap-8 px-16">
      <TransactionContent
        setSelectedTransaction={setSelectedTransaction}
        transactions={transactions}
        setOpen={setOpen}
        open={open}
        address={address}
        isLoading={isLoading}
        isWalletConnected={isWalletConnected}
        page={pageString}
        hasNextPage={hasNextPage}
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
    </main>
  );
});

export default Transactions;
