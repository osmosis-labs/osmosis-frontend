import { WalletStatus } from "@cosmos-kit/core";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/** Assumed wallet connected */
export const Swapped: FunctionComponent<
  { assetKey: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = observer(() => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  if (!(account?.walletStatus === WalletStatus.Connected) || !account.address)
    return null;

  const { data: signature } = api.local.swapped.getSignature.useQuery({
    walletAddress: account.address,
  });

  if (!signature?.url) return null;

  return (
    <iframe
      src={signature.url}
      width="420"
      height="700"
      allow="clipboard-write; payment; accelerometer; gyroscope; camera; geolocation; autoplay; fullscreen;"
    />
  );
});
