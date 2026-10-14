import { WalletStatus } from "@cosmos-kit/core";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { OsmosisChainInfo } from "~/config/chain";
import { ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

/** Assumed wallet connected */
export const OnrampMoney: FunctionComponent<
  Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = observer(() => {
  const { accountStore } = useStore();

  const account = accountStore.getWallet(OsmosisChainInfo.chainId);

  if (!(account?.walletStatus === WalletStatus.Connected)) return null;

  return (
    <iframe
      src={`https://onramp.money/osmosis?walletAddress=${account?.address}`}
      width="420"
      height="700"
    />
  );
});
