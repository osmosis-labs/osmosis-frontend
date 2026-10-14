import { WalletStatus } from "@cosmos-kit/core";
import { FunctionComponent } from "react";

import { useWallet } from "~/hooks/use-wallet";
import { ModalBaseProps } from "~/modals";
import { api } from "~/utils/trpc";

/** Assumed wallet connected */
export const Swapped: FunctionComponent<
  { assetKey: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = () => {
  const { address, walletStatus } = useWallet();

  const isConnected = walletStatus === WalletStatus.Connected && !!address;
  const { data: signature } = api.local.swapped.getSignature.useQuery(
    { walletAddress: address ?? "" },
    { enabled: isConnected }
  );

  if (!isConnected) return null;

  if (!signature?.url) return null;

  return (
    <iframe
      src={signature.url}
      width="420"
      height="700"
      allow="clipboard-write; payment; accelerometer; gyroscope; camera; geolocation; autoplay; fullscreen;"
    />
  );
};
