import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { TransferStatus } from "@osmosis-labs/bridge";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { RecentTransferRow, SwapRow } from "./recent-activity-transaction-row";

const ACTIVITY_LIMIT = 5;

const RecentActivitySkeleton = () => {
  return (
    <>
      {Array.from({ length: ACTIVITY_LIMIT }).map((_, index) => (
        <div key={index} className="-mx-2 flex justify-between gap-4 p-2">
          <Skeleton className="h-9 w-1/3 " />
          <Skeleton className="h-9 w-1/5" />
        </div>
      ))}
    </>
  );
};

// v1 includes top 5 transactions from transaction history
export const RecentActivity: FunctionComponent = observer(() => {
  const { t } = useTranslation();
  const { accountStore, transferHistoryStore } = useStore();

  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const recentTransfers = transferHistoryStore.getHistoriesByAccount(
    wallet?.address || ""
  );

  const { data: transactionsData, isFetched: isGetTransactionsFetched } =
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

  const transactions = useMemo(
    () => transactionsData?.transactions ?? [],
    [transactionsData]
  );

  const mergedActivity = useMemo(
    () => [
      ...transactions.map((tx) => ({
        ...tx,
        type: "transaction" as const,
        compareDate: new Date(tx.blockTimestamp),
      })),
      ...recentTransfers.map((transfer) => ({
        ...transfer,
        type: "recentTransfer" as const,
        compareDate: transfer.createdAt,
      })),
    ],
    [transactions, recentTransfers]
  );

  const sortedActivity = useMemo(
    () =>
      mergedActivity.sort(
        (a, b) => b.compareDate.getTime() - a.compareDate.getTime()
      ),
    [mergedActivity]
  );

  const showNoTransactionsSplash = transactions.length === 0;

  const topActivity = sortedActivity.slice(0, ACTIVITY_LIMIT);

  return (
    <div className="flex w-full flex-col py-3">
      <div className="flex items-center justify-between gap-3">
        <h6 className="py-3">{t("portfolio.recentActivity")}</h6>
        <LinkButton
          href="/transactions"
          className="-mx-2 text-osmoverse-400"
          label={t("portfolio.seeAll")}
          ariaLabel={t("portfolio.seeAll")}
          size="md"
        />
      </div>
      <div className="flex flex-col justify-between self-stretch py-2">
        {!isGetTransactionsFetched ? (
          <RecentActivitySkeleton />
        ) : showNoTransactionsSplash ? (
          <NoTransactionsSplash variant="transactions" />
        ) : (
          topActivity.map((activity) => {
            if (activity.type === "transaction") {
              return (
                <SwapRow
                  hash={activity.hash}
                  key={activity.id}
                  title={{
                    pending: t("transactions.swapping"),
                    success: t("transactions.swapped"),
                    failed: t("transactions.swapFailed"),
                  }}
                  effect="swap"
                  status={activity.code === 0 ? "success" : "failed"}
                  tokenConversion={{
                    tokenIn: {
                      amount:
                        activity?.metadata?.[0]?.value?.[0]?.txInfo?.tokenIn
                          ?.token,
                      value:
                        activity?.metadata?.[0]?.value?.[0]?.txInfo?.tokenIn
                          ?.usd,
                    },
                    tokenOut: {
                      amount:
                        activity?.metadata?.[0]?.value?.[0]?.txInfo?.tokenOut
                          ?.token,

                      value: activity.metadata[0].value[0].txInfo.tokenOut.usd,
                    },
                  }}
                />
              );
            }

            if (activity.type === "recentTransfer") {
              console.log(activity);
              const getSimplifiedStatus = (status: TransferStatus) => {
                if (status === "success") return "success";
                if (["refunded", "connection-error", "failed"].includes(status))
                  return "failed";
                return "pending";
              };

              const simplifiedStatus = getSimplifiedStatus(activity.status);

              const pendingText =
                activity.direction === "withdraw"
                  ? t("transactions.historyTable.pendingWithdraw")
                  : t("transactions.historyTable.pendingDeposit");
              const successText =
                activity.direction === "withdraw"
                  ? t("transactions.historyTable.successWithdraw")
                  : t("transactions.historyTable.successDeposit");
              const failedText =
                activity.direction === "withdraw"
                  ? t("transactions.historyTable.failWithdraw")
                  : t("transactions.historyTable.failDeposit");

              return (
                <RecentTransferRow
                  toChain={activity?.toChain}
                  fromChain={activity?.fromChain}
                  key={activity.sendTxHash}
                  status={simplifiedStatus}
                  effect={
                    activity.direction === "withdraw" ? "withdraw" : "deposit"
                  }
                  title={{
                    pending: pendingText,
                    success: successText,
                    failed: failedText,
                  }}
                  transfer={{
                    direction:
                      activity.direction === "withdraw"
                        ? "withdraw"
                        : "deposit",
                    amount: new CoinPretty(
                      {
                        coinDecimals: activity.fromAsset.decimals,
                        coinDenom: activity.fromAsset.denom,
                        coinMinimalDenom: activity.fromAsset.address,
                        coinImageUrl: activity.fromAsset.imageUrl,
                      },
                      new Dec(activity.fromAsset.amount)
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
