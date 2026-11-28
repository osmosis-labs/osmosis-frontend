import type { MappedLimitOrder } from "@osmosis-labs/server";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQueryState } from "nuqs";
import { memo, useEffect, useMemo, useState } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import {
  OrderDetailsSlideover,
  OrderModal,
} from "~/components/complex/orders-history/order-modal";
import { TransactionContent } from "~/components/transactions/transaction-content";
import { TransactionDetailsModal } from "~/components/transactions/transaction-details-modal";
import { TransactionDetailsSlideover } from "~/components/transactions/transaction-details-slideover";
import {
  isAllKinds,
  useTransactionFilters,
} from "~/components/transactions/transaction-filters";
import { useTransactionModal } from "~/components/transactions/use-transaction-details-state";
import {
  useFeatureFlags,
  useNavBar,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { useTransactionHistory } from "~/hooks/use-transaction-history";
import { useWallet } from "~/hooks/use-wallet";
import type { CallToAction } from "~/stores/nav-bar-store";

// Stable reference: the nav bar clears any previous page's CTAs, and a fresh
// `[]` each render would re-run the nav-bar effect (reloading the title icon).
const NO_CTAS: CallToAction[] = [];

const Transactions: React.FC = memo(() => {
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

  const { wallet, address: walletAddress, isWalletConnected } = useWallet();
  // for easy testing, pass in an optional address query string to override connected address
  // /transactions?page=0&address=osmoADDRESS
  const address = addressFromQueryString || walletAddress || "";

  const { isLoading: isWalletLoading } = useWalletSelect();

  // type filters run in the API, so they apply across all pages
  const [{ txTypes }] = useTransactionFilters();
  const { transactions, hasNextPage, isLoading, isError } =
    useTransactionHistory({
      pageNumber: pageString,
      pageSize: pageSizeString,
      types: isAllKinds(txTypes) ? undefined : [...txTypes],
    });

  useEffect(() => {
    if (!transactionsPage && _isInitialized) {
      router.push("/");
    }
  }, [transactionsPage, router, _isInitialized]);

  const [fromPage] = useQueryState("fromPage");
  const [fromPath] = useQueryState("from");
  // The symbol the asset-page link carries (e.g. "OSMO"), used only as the back
  // button's label. The href still comes from the trusted path below.
  const [assetLabel] = useQueryState("asset");

  const { t } = useTranslation();

  // Where the back button points depends on where the user arrived from.
  // An asset path is only trusted when it is internal, so a crafted `from`
  // query value cannot turn the back button into an open redirect.
  const back = (() => {
    if (fromPath?.startsWith("/assets/")) {
      // The href must stay the trusted internal path, but the label can show
      // the human-readable symbol the link carries (the path segment is the
      // raw denom, e.g. "uosmo"). Fall back to that segment, then Portfolio.
      const denomSegment = decodeURIComponent(
        fromPath.slice("/assets/".length).split(/[/?#]/)[0]
      );
      return {
        href: fromPath,
        label: assetLabel || denomSegment || t("menu.portfolio"),
      };
    }
    if (fromPage === "swap") {
      return { href: "/", label: t("limitOrders.trade") };
    }
    return { href: "/portfolio", label: t("menu.portfolio") };
  })();

  // Memoize on the label/href strings so typing in the asset filter (which
  // re-renders this page) doesn't rebuild the title and reload its icon.
  const navTitle = useMemo(
    () => (
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
        label={back.label}
        ariaLabel={back.label}
        href={back.href}
      />
    ),
    [back.label, back.href]
  );

  useNavBar({ title: navTitle, ctas: NO_CTAS });

  const {
    open,
    setOpen,
    selectedTransactionHash,
    setSelectedTransactionHash,
    onRequestClose,
    selectedTransaction,
    showSlideover,
  } = useTransactionModal({ transactions });

  const [tab] = useQueryState("tab");
  const [selectedOrder, setSelectedOrder] = useState<MappedLimitOrder>();
  // Closing the side panel slides it out first and clears the order after, so
  // the table keeps its layout and widens as the panel shrinks.
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const selectOrder = (order: MappedLimitOrder) => {
    setSelectedOrder(order);
    setIsOrderPanelOpen(true);
  };

  return (
    <main className="mx-auto flex max-w-7xl px-16 lg:px-8 md:px-4">
      <TransactionContent
        setSelectedTransactionHash={setSelectedTransactionHash}
        selectedTransactionHash={selectedTransactionHash}
        transactions={transactions}
        setOpen={setOpen}
        open={open}
        address={address}
        isLoading={isLoading || isWalletLoading}
        isError={isError}
        isWalletConnected={isWalletConnected}
        page={pageString}
        hasNextPage={hasNextPage}
        wallet={wallet}
        selectedOrder={selectedOrder}
        onOrderSelect={selectOrder}
        onSelectedOrderChange={setSelectedOrder}
      />
      {tab === "orders" ? (
        showSlideover ? (
          <OrderDetailsSlideover
            order={selectedOrder}
            open={isOrderPanelOpen}
            onRequestClose={() => setIsOrderPanelOpen(false)}
            afterLeave={() => setSelectedOrder(undefined)}
          />
        ) : (
          <OrderModal
            order={selectedOrder}
            onRequestClose={() => setSelectedOrder(undefined)}
          />
        )
      ) : showSlideover ? (
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
