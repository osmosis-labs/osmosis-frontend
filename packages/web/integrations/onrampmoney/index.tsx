import { WalletStatus } from "@cosmos-kit/core";
import { FunctionComponent } from "react";

import { useWallet } from "~/hooks/use-wallet";
import { ModalBaseProps } from "~/modals";

/** Assumed wallet connected */
export const OnrampMoney: FunctionComponent<
  Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = () => {
  const { address, walletStatus } = useWallet();

  if (!(walletStatus === WalletStatus.Connected)) return null;

  return (
    <iframe
      src={`https://onramp.money/osmosis?walletAddress=${address}`}
      width="420"
      height="700"
    />
  );
};
