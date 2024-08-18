import { WalletStatus } from "@cosmos-kit/core";
import { ComponentProps, useCallback, useEffect, useState } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { t } from "~/hooks";
import { useWalletSelect } from "~/hooks/use-wallet-select";
import { useStore } from "~/stores";

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
  _onRequestClose?: () => void,
  connectWalletMessage = t("connectWallet"),
  onConnect?: () => void
) {
  const { accountStore } = useStore();
  const osmosisAccount = accountStore.getWallet(accountStore.osmosisChainId);

  const { onOpenWalletSelect, isLoading: isWalletLoading_ } = useWalletSelect();
  const isWalletLoading =
    isWalletLoading_ ||
    osmosisAccount?.walletStatus === WalletStatus.Connecting;

  const [walletInitiallyConnected, setWalletInitiallyConnected] = useState(
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

  const resetState = useCallback(() => {
    setShowSelf(false);
    setWalletInitiallyConnected(
      osmosisAccount?.walletStatus === WalletStatus.Connected
    );
  }, [osmosisAccount?.walletStatus]);

  const defaultChildren = (
    <h6 className="flex items-center gap-3">
      <Icon id="wallet" className="text-white h-[24px] w-[24px]" />
      {connectWalletMessage}
    </h6>
  );

  return {
    showModalBase: showSelf,
    accountActionButton:
      isWalletLoading ||
      osmosisAccount?.walletStatus === WalletStatus.Connected ? (
        <Button {...actionButtonProps}>
          {actionButtonProps?.children ?? defaultChildren}
        </Button>
      ) : (
        <Button
          {...actionButtonProps}
          disabled={false}
          onClick={() => {
            onOpenWalletSelect({
              walletOptions: [
                { walletType: "cosmos", chainId: accountStore.osmosisChainId },
              ],
              onConnect,
            }); // show select connect modal
            setShowSelf(false);
          }}
        >
          {defaultChildren}
        </Button>
      ),
    walletConnected: osmosisAccount?.walletStatus === WalletStatus.Connected,
    resetState,
  };
}
