import { WalletStatus } from "@cosmos-kit/core";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

/** Assumed wallet connected */
export const OnrampMoney: FunctionComponent<
  { assetKey: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = observer(({ assetKey }) => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  if (!(account?.walletStatus === WalletStatus.Connected)) return null;

  return (
    <iframe
      src={`https://onramp.money/main/buy/?appId=1`}
      width="420"
      height="700"
    />
  );
});
