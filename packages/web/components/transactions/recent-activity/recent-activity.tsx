import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { TransferStatus } from "@osmosis-labs/bridge";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { AssetLists } from "~/config/generated/asset-lists";
import { useTranslation, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { Spinner } from "../../loaders";
import { useRecentTransfers } from "../use-recent-transfers";
import {
  RecentActivityTransactionRow,
  RecentActivityTransferRow,
} from "./recent-activity-transaction-row";

const ACTIVITY_LIMIT = 5;

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

  const mergedActivity = [
    ...transactions.map((tx) => ({
      ...tx,
      type: "transaction",
      compareDate: new Date(tx.blockTimestamp),
      compareTxHash: tx.hash,
    })),
    ...recentTransfers.map((transfer) => ({
      ...transfer,
      type: "recentTransfer",
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
          <Spinner />
        ) : topActivity?.length === 0 ? (
          <NoTransactionsSplash variant="transfers" />
        ) : (
          topActivity.map((activity) => {
            if (activity.type === "transaction") {
              return (
                <RecentActivityTransactionRow
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
              const getSimplifiedStatus = (status: TransferStatus) => {
                if (status === "success") return "success";
                if (["refunded", "connection-error", "failed"].includes(status))
                  return "failed";
                return "pending";
              };

              const simplifiedStatus = getSimplifiedStatus(activity.status);

              const coinAmount = activity.amount.split(" ")[0];
              const coinDenom = activity.amount.split(" ")[1];
              const asset = AssetLists.flatMap(({ assets }) => assets).find(
                ({ symbol }) => symbol === coinDenom
              );

              if (!asset) return null;

              const currency = makeMinimalAsset(asset);

              const pendingText = activity.isWithdraw
                ? t("assets.historyTable.pendingWithdraw")
                : t("assets.historyTable.pendingDeposit");
              const successText = activity.isWithdraw
                ? t("assets.historyTable.successWithdraw")
                : t("assets.historyTable.successDeposit");
              const failedText = activity.isWithdraw
                ? t("assets.historyTable.failWithdraw")
                : t("assets.historyTable.failDeposit");

              return (
                <RecentActivityTransferRow
                  key={activity.txHash}
                  status={simplifiedStatus}
                  effect={activity.isWithdraw ? "withdraw" : "deposit"}
                  title={{
                    pending: pendingText,
                    success: successText,
                    failed: failedText,
                  }}
                  transfer={{
                    direction: activity.isWithdraw ? "withdraw" : "deposit",
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
