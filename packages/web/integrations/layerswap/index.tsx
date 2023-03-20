import { FunctionComponent } from "react";
import { WalletStatus } from "@keplr-wallet/stores";
import { useStore } from "../../stores";
import { ModalBaseProps } from "../../modals";

/** Assumed wallet connected */
export const Layerswap: FunctionComponent<
  {} & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = ({}) => {
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
};
