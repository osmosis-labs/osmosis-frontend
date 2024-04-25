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

const EXAMPLE = {
  ADDRESS: "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3",
  PAGE: 0,
  PAGE_SIZE: 100,
};

const Transactions: React.FC = observer(() => {
  const { transactionsPage, _isInitialized } = useFeatureFlags();

  const router = useRouter();
  const { page = "0", pageSize = "100" } = router.query;

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
        page,
        pageSize,
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

  return (
    <main className="mx-16 flex gap-4">
      <TransactionContent
        setSelectedTransaction={setSelectedTransaction}
        transactions={transactionData}
        setOpen={setOpen}
        open={open}
        address={address}
        isLoading={isLoading}
        isWalletConnected={isWalletConnected}
        page={page}
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
