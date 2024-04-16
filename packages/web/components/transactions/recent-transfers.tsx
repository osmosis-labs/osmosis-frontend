import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";

import { Spinner } from "../loaders";
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

    return <div></div>;
  }
);

const NoTransfersSplash: FunctionComponent = () => (
  <div className="flex flex-col gap-2">
    <Image
      src="/images/ion-thumbs-up.svg"
      alt="ion thumbs up"
      width="260"
      height="160"
    />
    <div className="flex flex-col gap-1">
      <h6>No recent transfers</h6>
      <p>
        Deposits and withdrawals in the last 3 days on this device (between
        certain networks) will appear here.
      </p>
    </div>
  </div>
);
