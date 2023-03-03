import { WalletStatus } from "@cosmos-kit/core";
import { FunctionComponent } from "react";

import { ModalBaseProps } from "../../modals";
import { useStore } from "../../stores";

/** Assumed wallet connected */
export const Layerswap: FunctionComponent<
  {} & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = ({}) => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  if (!(account?.walletStatus === WalletStatus.Connected)) return null;

  return (
    <iframe
      src={`https://www.layerswap.io/?destNetwork=osmosis_mainnet&sourceExchangeName=Coinbase&destAddress=${account?.address}&addressSource=osmosiszone&lockNetwork=true&products=CEX_TO_NETWORK`}
      width="420"
      height="700"
    />
  );
};
