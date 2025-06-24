import { WalletStatus } from "@cosmos-kit/core";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

/** Assumed wallet connected */
export const Kado: FunctionComponent<
  { assetKey: string } & Pick<ModalBaseProps, "isOpen" | "onRequestClose">
> = observer(({ assetKey }) => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  if (!(account?.walletStatus === WalletStatus.Connected)) return null;

  return (
    <iframe
      src={`https://app.kado.money/?onPayCurrency=USD&onPayAmount=200&onRevCurrency=OSMO&offPayCurrency=${assetKey}&offRevCurrency=USD&network=OSMOSIS&onToAddress=${account?.address}&offFromAddress=X&cryptoList=OSMO,USDC,wBTC&networkList=OSMOSIS&apiKey=67a2aaad-a2a5-4412-be40-e3a70aa7b53d&product=BUY`}
      width="420"
      height="700"
      allow="clipboard-write; payment; accelerometer; gyroscope; camera; geolocation; autoplay; fullscreen;"
    />
  );
});
