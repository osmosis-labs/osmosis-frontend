import { WalletStatus } from "@cosmos-kit/core";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

/** Assumed wallet connected */
export const Kado: FunctionComponent<
  Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = observer(() => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  if (!(account?.walletStatus === WalletStatus.Connected)) return null;

  return (
    <iframe
      src={`https://widget.swapped.com/`}
      width="420"
      height="700"
      allow="clipboard-write; payment; accelerometer; gyroscope; camera; geolocation; autoplay; fullscreen;"
    />
  );
});
