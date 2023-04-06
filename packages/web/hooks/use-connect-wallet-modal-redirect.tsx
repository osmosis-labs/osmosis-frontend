import { WalletStatus } from "@cosmos-kit/core";
import Image from "next/image";
import { ComponentProps, useEffect, useState } from "react";
import { t } from "react-multi-lang";

import { Button } from "../components/buttons";
import { useStore } from "../stores";
import { useWalletSelect } from "./wallet-select";

/** FOR USE IN MODALS
 *
 *  If your modal contains a user action that is only possible with a connected wallet on the Osmosis account.
 *  This hook allows your modal to temporarily redirect to the `wallet-select` modal.
 *  If the user connects the wallet, your modal will appear after. If the user closes the connection
 *  selection modal, your modal will no longer appear, even if they connect to the wallet later.
 *
 * @param actionButtonProps Props for the user action `<Button />` that may be replaced with a "Connect Wallet" button which adopts these styles.
 * @param onRequestClose Required callback to request this modal to be popped from `react-modal`. Use to set modal state to `null`/`false`.
 * @returns
 *   * `showModalBase` - Flag for whether the calling component should be shown. `ModalBase` will likely take on these props: `<ModalBase {...props} isOpen={props.isOpen && showModalBase} />`
 *   * `accountActionButton` - JSXElement containing the wrapped action `<Button />` with the given button props (styles). May be a "Connect Account" button if a wallet is not connected. Accepts children.
 */
export function useConnectWalletModalRedirect(
  actionButtonProps: ComponentProps<typeof Button>,
  _onRequestClose: () => void,
  connectWalletMessage = t("connectWallet")
) {
  const { accountStore, chainStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const osmosisAccount = accountStore.getWallet(chainId);

  const { onOpenWalletSelect } = useWalletSelect();

  const [walletInitiallyConnected] = useState(
    () => osmosisAccount?.walletStatus === WalletStatus.Connected
  );
  const [showSelf, setShowSelf] = useState(true);

  useEffect(() => {
    if (
      !walletInitiallyConnected &&
      osmosisAccount?.walletStatus === WalletStatus.Connected
    ) {
      setShowSelf(true);
    }
  }, [osmosisAccount?.walletStatus, walletInitiallyConnected]);

  return {
    showModalBase: showSelf,
    accountActionButton:
      osmosisAccount?.walletStatus === WalletStatus.Connected ? (
        <Button {...actionButtonProps}>{actionButtonProps.children}</Button>
      ) : (
        <Button
          {...actionButtonProps}
          disabled={false}
          onClick={() => {
            onOpenWalletSelect(chainId); // show select connect modal
            setShowSelf(false);
          }}
        >
          <h6 className="flex items-center gap-3">
            <Image
              alt="wallet"
              src="/icons/wallet.svg"
              height={24}
              width={24}
            />
            {connectWalletMessage}
          </h6>
        </Button>
      ),
    walletConnected: osmosisAccount?.walletStatus === WalletStatus.Connected,
  };
}
