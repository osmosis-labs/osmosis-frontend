import { WalletStatus } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { ModalBaseProps } from "../../modals";
import { useStore } from "../../stores";

/** Assumed wallet connected */
export const Layerswap: FunctionComponent<
  Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = observer(() => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.osmosis.chainId);

  if (!(account.walletStatus === WalletStatus.Loaded)) return null;

  return (
    <iframe
      src={`https://www.layerswap.io/?destNetwork=osmosis_mainnet&sourceExchangeName=Coinbase&destAddress=${account.bech32Address}&addressSource=osmosiszone&lockNetwork=true&lockExchange=true&products=CEX_TO_NETWORK`}
      width="420"
      height="700"
    />
  );
});
