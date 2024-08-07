import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { TransferStatus } from "@osmosis-labs/bridge";
import { FormattedTransaction } from "@osmosis-labs/server";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { Skeleton } from "~/components/ui/skeleton";
import { AssetLists } from "~/config/generated/asset-lists";
import { useTranslation, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { RecentTransfer, useRecentTransfers } from "../use-recent-transfers";
import { SwapRow, TransferRow } from "./recent-activity-transaction-row";

type ActivityType = "transaction" | "recentTransfer";

interface MergedActivityMetadata {
  type: ActivityType;
  compareDate: Date;
  compareTxHash: string;
}

type MergedActivity =
  | (RecentTransfer & MergedActivityMetadata)
  | (FormattedTransaction & MergedActivityMetadata);

const ACTIVITY_LIMIT = 5;

const RecentActivitySkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex w-full justify-between">
          <Skeleton className="h-10 w-1/3 " />
          <Skeleton className="h-10 w-1/5" />
        </div>
      ))}
    </div>
  );
};

export const RecentActivity: FunctionComponent = observer(() => {
  const { accountStore } = useStore();
  const { isLoading: isWalletLoading } = useWalletSelect();

  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const { t } = useTranslation();

  const recentTransfers = useRecentTransfers(wallet?.address);

  console.log("Recent Transfers: ", recentTransfers);

  const { data: transactionsData, isFetching: isGetTransactionsFetching } =
    api.edge.transactions.getTransactions.useQuery(
      {
        address: wallet?.address || "",
        page: "0",
        pageSize: "100",
      },
      {
        enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
      }
    );

  const isLoading = isWalletLoading || isGetTransactionsFetching;

  const { transactions } = transactionsData ?? {
    transactions: [],
    hasNextPage: false,
  };

  const mergedActivity: MergedActivity[] = [
    ...transactions.map((tx) => ({
      ...tx,
      type: "transaction" as ActivityType,
      compareDate: new Date(tx.blockTimestamp),
      compareTxHash: tx.hash,
    })),
    ...recentTransfers.map((transfer) => ({
      ...transfer,
      type: "recentTransfer" as ActivityType,
      compareDate: new Date(transfer.createdAtMs),
      compareTxHash: transfer.txHash,
    })),
  ];

  const sortedActivity = mergedActivity.sort(
    (a, b) => b.compareDate.getTime() - a.compareDate.getTime()
  );

  // filter out duplicate transactions (edge case)
  const uniqueActivity = sortedActivity.filter((item, index, self) => {
    return (
      index === self.findIndex((t) => t.compareTxHash === item.compareTxHash)
    );
  });

  const topActivity = uniqueActivity.slice(0, ACTIVITY_LIMIT);

  return (
    <div className="flex w-full flex-col">
      <div className="flex cursor-pointer items-center justify-between py-3">
        <h6>{t("portfolio.recentActivity")}</h6>
        <LinkButton
          href="/transactions"
          className="text-osmoverse-400"
          label={t("portfolio.seeAll")}
          ariaLabel={t("portfolio.seeAll")}
          size="sm"
        />
      </div>
      <div className="flex w-full flex-col">
        {isLoading ? (
          <RecentActivitySkeleton />
        ) : topActivity?.length === 0 ? (
          <NoTransactionsSplash variant="transfers" />
        ) : (
          topActivity.map((activity) => {
            if (activity.type === "transaction") {
              const recentTransactionActivity =
                activity as FormattedTransaction & MergedActivityMetadata;

              return (
                <SwapRow
                  key={recentTransactionActivity.id}
                  title={{
                    pending: t("transactions.swapping"),
                    success: t("transactions.swapped"),
                    failed: t("transactions.swapFailed"),
                  }}
                  effect="swap"
                  status={
                    recentTransactionActivity.code === 0 ? "success" : "failed"
                  }
                  tokenConversion={{
                    tokenIn: {
                      amount:
                        recentTransactionActivity?.metadata?.[0]?.value?.[0]
                          ?.txInfo?.tokenIn?.token,
                      value:
                        recentTransactionActivity?.metadata?.[0]?.value?.[0]
                          ?.txInfo?.tokenIn?.usd,
                    },
                    tokenOut: {
                      amount:
                        recentTransactionActivity?.metadata?.[0]?.value?.[0]
                          ?.txInfo?.tokenOut?.token,

                      value:
                        recentTransactionActivity.metadata[0].value[0].txInfo
                          .tokenOut.usd,
                    },
                  }}
                />
              );
            }

            if (activity.type === "recentTransfer") {
              const recentTransferActivity = activity as RecentTransfer &
                MergedActivityMetadata;

              const getSimplifiedStatus = (status: TransferStatus) => {
                if (status === "success") return "success";
                if (["refunded", "connection-error", "failed"].includes(status))
                  return "failed";
                return "pending";
              };

              const simplifiedStatus = getSimplifiedStatus(
                recentTransferActivity.status
              );

              const coinAmount = recentTransferActivity.amount.split(" ")[0];
              const coinDenom = recentTransferActivity.amount.split(" ")[1];
              const asset = AssetLists.flatMap(({ assets }) => assets).find(
                ({ symbol }) => symbol === coinDenom
              );

              if (!asset) return null;

              const currency = makeMinimalAsset(asset);

              const pendingText = recentTransferActivity.isWithdraw
                ? t("assets.historyTable.pendingWithdraw")
                : t("assets.historyTable.pendingDeposit");
              const successText = recentTransferActivity.isWithdraw
                ? t("assets.historyTable.successWithdraw")
                : t("assets.historyTable.successDeposit");
              const failedText = recentTransferActivity.isWithdraw
                ? t("assets.historyTable.failWithdraw")
                : t("assets.historyTable.failDeposit");

              return (
                <TransferRow
                  toChainId={recentTransferActivity?.toChainId}
                  fromChainId={recentTransferActivity?.fromChainId}
                  key={recentTransferActivity.txHash}
                  status={simplifiedStatus}
                  effect={
                    recentTransferActivity.isWithdraw ? "withdraw" : "deposit"
                  }
                  title={{
                    pending: pendingText,
                    success: successText,
                    failed: failedText,
                  }}
                  transfer={{
                    direction: recentTransferActivity.isWithdraw
                      ? "withdraw"
                      : "deposit",
                    amount: new CoinPretty(
                      currency,
                      new Dec(coinAmount).mul(
                        DecUtils.getTenExponentN(currency.coinDecimals)
                      ) // amount includes decimals
                    ),
                  }}
                />
              );
            }

            return null;
          })
        )}
      </div>
    </div>
  );
});
