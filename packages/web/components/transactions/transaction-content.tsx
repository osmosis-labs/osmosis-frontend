import { FormattedTransaction } from "@osmosis-labs/server";
import {
  AccountStoreWallet,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
} from "@osmosis-labs/stores";
import { useRouter } from "next/router";

import { BackToTopButton } from "~/components/buttons/back-to-top-button";
import { Spinner } from "~/components/loaders";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { TransactionButtons } from "~/components/transactions/transaction-buttons";
import { TransactionsPaginaton } from "~/components/transactions/transaction-pagination";
import { TransactionRows } from "~/components/transactions/transaction-rows";
import { useTranslation } from "~/hooks";

export const TransactionContent = ({
  setSelectedTransaction,
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
  setSelectedTransaction: (selectedTransaction: FormattedTransaction) => void;
  transactions?: FormattedTransaction[];
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

  const showTransactionContent =
    wallet &&
    wallet.isWalletConnected &&
    wallet.address &&
    transactions.length > 0;

  const showConnectWallet = !isWalletConnected && !isLoading;

  return (
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
        <TransactionButtons open={open} address={address} />
      </div>

      <div className="-mx-4 flex flex-col">
        {showConnectWallet ? (
          <NoTransactionsSplash variant="connect" />
        ) : showTransactionContent ? (
          <TransactionRows
            transactions={transactions}
            setSelectedTransaction={setSelectedTransaction}
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
              query: { ...router.query, page: Math.max(0, +page - 1) },
            }}
            nextHref={{
              pathname: router.pathname,
              query: { ...router.query, page: +page + 1 },
            }}
          />
        )}
      </div>
      <BackToTopButton />
    </div>
  );
};
