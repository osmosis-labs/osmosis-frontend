import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  AccountStoreWallet,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
} from "@osmosis-labs/stores";
import classNames from "classnames";
import { useRouter } from "next/router";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import { BackToTopButton } from "~/components/buttons/back-to-top-button";
import { ClientOnly } from "~/components/client-only";
import { OrderHistory } from "~/components/complex/orders-history";
import { Spinner } from "~/components/loaders";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { TransactionOptionsMenu } from "~/components/transactions/transaction-options-menu";
import { TransactionsPaginaton } from "~/components/transactions/transaction-pagination";
import { TransactionRows } from "~/components/transactions/transaction-rows";
import { useTranslation } from "~/hooks";
import { HistoryTransaction } from "~/hooks/use-transaction-history";

const TX_PAGE_TABS = ["history", "orders"] as const;

export const TransactionContent = ({
  setSelectedTransactionHash,
  selectedTransactionHash,
  transactions = [],
  setOpen,
  open,
  address,
  isLoading,
  isWalletConnected,
  page,
  hasNextPage,
  wallet,
}: {
  setSelectedTransactionHash: (hash: string) => void;
  selectedTransactionHash?: string;
  transactions?: HistoryTransaction[];
  setOpen: (open: boolean) => void;
  open: boolean;
  address: string;
  isLoading: boolean;
  isWalletConnected: boolean;
  page: string;
  hasNextPage: boolean;
  wallet?: AccountStoreWallet<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>;
}) => {
  const { t } = useTranslation();

  const showPagination = isWalletConnected && !isLoading;

  const router = useRouter();

  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(TX_PAGE_TABS).withDefault("history")
  );

  const showTransactionContent =
    wallet &&
    wallet.isWalletConnected &&
    wallet.address &&
    transactions.length > 0;

  const showConnectWallet = !isWalletConnected && !isLoading;

  return (
    <ClientOnly className="w-full">
      <div className="flex w-full flex-col pb-16">
        <div className="flex w-full justify-between pt-8 pb-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-h3 font-h3 md:text-h5 md:font-h5">
              {t("transactions.title")}
            </h1>
            <p className="body2 text-osmoverse-200 opacity-50">
              {t("transactions.launchAlert")}
            </p>
          </div>
          <TransactionOptionsMenu open={open} address={address} />
        </div>

        <TabGroup
          manual
          selectedIndex={TX_PAGE_TABS.indexOf(tab)}
          onChange={(idx) => setTab(TX_PAGE_TABS[idx])}
        >
          <TabList className="flex items-center gap-8">
            {TX_PAGE_TABS.map((defaultTab) => (
              <Tab key={defaultTab}>
                <span
                  className={classNames(
                    {
                      "text-osmoverse-500": defaultTab !== tab,
                    },
                    "text-h5 font-h5 sm:text-h6"
                  )}
                >
                  {t(
                    defaultTab === "history"
                      ? "transactions.history"
                      : "transactions.orders"
                  )}
                </span>
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <>
                <div className="-mx-4 flex flex-col">
                  {showConnectWallet ? (
                    <NoTransactionsSplash variant="connect" />
                  ) : showTransactionContent ? (
                    <TransactionRows
                      transactions={transactions}
                      setSelectedTransactionHash={setSelectedTransactionHash}
                      selectedTransactionHash={selectedTransactionHash}
                      setOpen={setOpen}
                      open={open}
                    />
                  ) : isLoading ? (
                    <Spinner className="self-center" />
                  ) : transactions.length === 0 ? (
                    <NoTransactionsSplash variant="transactions" />
                  ) : null}
                </div>
                <div className="py-6">
                  {showPagination && (
                    <TransactionsPaginaton
                      showPrevious={+page > 0}
                      showNext={hasNextPage}
                      previousHref={{
                        pathname: router.pathname,
                        query: {
                          ...router.query,
                          page: Math.max(0, +page - 1),
                        },
                      }}
                      nextHref={{
                        pathname: router.pathname,
                        query: { ...router.query, page: +page + 1 },
                      }}
                    />
                  )}
                </div>
                <BackToTopButton />
              </>
            </TabPanel>
            <TabPanel>
              <OrderHistory />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </ClientOnly>
  );
};
