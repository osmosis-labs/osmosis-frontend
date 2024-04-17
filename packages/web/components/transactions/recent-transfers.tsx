import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

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
  return <NoTransfersSplash />;
});

const UserRecentTransfers: FunctionComponent<{ address: string }> = observer(
  ({ address }) => {
    const { t } = useTranslation();

    const recentTransfers = useRecentTransfers(address);

    if (recentTransfers.length === 0) return <NoTransfersSplash />;

    return (
      <div className="flex w-full flex-col gap-2">
        {recentTransfers.map(({ txHash, status, amount, isWithdraw }) => {
          const simplifiedStatus =
            status === "complete"
              ? "success"
              : status === "refunded" ||
                status === "timeout" ||
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

const NoTransfersSplash: FunctionComponent = () => (
  <div className="mx-auto my-6 flex max-w-35 flex-col gap-6 text-center">
    <Image
      className="mx-auto"
      src="/images/ion-thumbs-up.svg"
      alt="ion thumbs up"
      width="260"
      height="160"
    />
    <div className="flex flex-col gap-2">
      <h6>No recent transfers</h6>
      <p className="body1 text-osmoverse-300">
        Deposits and withdrawals in the last 3 days on this device (between
        certain networks) will appear here.
      </p>
    </div>
  </div>
);
