import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { NoTransactionsSplash } from "~/components/transactions/no-transactions-splash";
import { AssetLists } from "~/config/generated/asset-lists";
import { useTranslation, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";

import { Spinner } from "../loaders";
import { TransactionRow } from "./transaction-row";
import { useRecentTransfers } from "./use-recent-transfers";

export const RecentTransfers: FunctionComponent = observer(() => {
  const { accountStore } = useStore();
  const { isLoading: isWalletLoading } = useWalletSelect();

  const account = accountStore.getWallet(accountStore.osmosisChainId);

  if (isWalletLoading) return <Spinner />;
  if (account?.address)
    return <UserRecentTransfers address={account.address} />;
  return <NoTransactionsSplash variant="transfers" />;
});

const UserRecentTransfers: FunctionComponent<{ address: string }> = observer(
  ({ address }) => {
    const { t } = useTranslation();

    const recentTransfers = useRecentTransfers(address);

    if (recentTransfers.length === 0)
      return <NoTransactionsSplash variant="transfers" />;

    return (
      <div className="flex w-full flex-col gap-2">
        {recentTransfers.map(({ txHash, status, amount, isWithdraw }) => {
          const simplifiedStatus =
            status === "success"
              ? "success"
              : status === "refunded" ||
                status === "connection-error" ||
                status === "failed"
              ? "failed"
              : "pending";

          const coinAmount = amount.split(" ")[0];
          const coinDenom = amount.split(" ")[1];
          const asset = AssetLists.flatMap(({ assets }) => assets).find(
            ({ symbol }) => symbol === coinDenom
          );

          if (!asset) return null;

          const currency = makeMinimalAsset(asset);

          const pendingText = isWithdraw
            ? t("assets.historyTable.pendingWithdraw")
            : t("assets.historyTable.pendingDeposit");
          const successText = isWithdraw
            ? t("assets.historyTable.successWithdraw")
            : t("assets.historyTable.successDeposit");
          const failedText = isWithdraw
            ? t("assets.historyTable.failWithdraw")
            : t("assets.historyTable.failDeposit");

          return (
            <TransactionRow
              key={txHash}
              status={simplifiedStatus}
              effect={isWithdraw ? "withdraw" : "deposit"}
              title={{
                pending: pendingText,
                success: successText,
                failed: failedText,
              }}
              transfer={{
                direction: isWithdraw ? "withdraw" : "deposit",
                amount: new CoinPretty(
                  currency,
                  new Dec(coinAmount).mul(
                    DecUtils.getTenExponentN(currency.coinDecimals)
                  ) // amount includes decimals
                ),
              }}
            />
          );
        })}
      </div>
    );
  }
);
