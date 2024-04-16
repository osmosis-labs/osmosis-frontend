import { CoinPretty } from "@keplr-wallet/unit";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { useWalletSelect } from "~/hooks";
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
    const recentTransfers = useRecentTransfers(address);

    if (recentTransfers.length === 0) return <NoTransfersSplash />;

    return (
      <div className="flex w-full flex-col gap-2">
        {recentTransfers.map((transfer) => {
          const status =
            transfer.status === "complete"
              ? "success"
              : transfer.status === "refunded" ||
                transfer.status === "timeout" ||
                transfer.status === "failed"
              ? "failed"
              : "pending";

          // TODO: translate title with timeout and refunding strings
          const coinAmount = transfer.amount.split(" ")[0];
          const coinDenom = transfer.amount.split(" ")[1];
          const asset = AssetLists.flatMap(({ assets }) => assets).find(
            ({ symbol }) => symbol === coinDenom
          );

          if (!asset) return null;

          const currency = makeMinimalAsset(asset);

          return (
            <TransactionRow
              key={transfer.txHash}
              status={status}
              effect={transfer.isWithdraw ? "withdraw" : "deposit"}
              title={{
                pending: "Pending",
                success: "Completed",
                failed: "Failed",
              }}
              transfer={{
                direction: transfer.isWithdraw ? "withdraw" : "deposit",
                amount: new CoinPretty(
                  currency,
                  coinAmount // amount includes decimals
                ).moveDecimalPointRight(currency.coinDecimals),
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
