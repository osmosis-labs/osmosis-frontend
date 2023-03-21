import { WalletStatus } from "@cosmos-kit/core";
import { FunctionComponent } from "react";

import { ModalBaseProps } from "../../modals";
import { useStore } from "../../stores";

/** Assumed wallet connected */
export const Kado: FunctionComponent<
  { assetKey: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = ({ assetKey }) => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  if (!(account?.walletStatus === WalletStatus.Connected)) return null;

  return (
    <iframe
      src={`https://app.kado.money/?onPayCurrency=USD&onPayAmount=200&onRevCurrency=${assetKey}&offPayCurrency=${assetKey}&offRevCurrency=USD&network=OSMOSIS&onToAddress=${account?.address}&offFromAddress=X&cryptoList=${assetKey}&networkList=OSMOSIS&apiKey=67a2aaad-a2a5-4412-be40-e3a70aa7b53d&product=BUY`}
      width="420"
      height="700"
    />
  );
};
