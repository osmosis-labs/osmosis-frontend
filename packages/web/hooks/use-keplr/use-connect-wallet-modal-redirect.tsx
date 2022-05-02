import Image from "next/image";
import { useState, useEffect, ComponentProps } from "react";
import { WalletStatus } from "@keplr-wallet/stores";
import { useStore } from "../../stores";
import { Button } from "../../components/buttons";
import { useKeplr } from "./hook";

/** FOR USE IN MODALS
 *
 *  If your modal contains a user action that is only possible with a connected wallet on the Osmosis account.
 *  This hook allows your modal to temporarily redirect to the `keplr-connection-selection` modal.
 *  If the user connects Keplr, your modal will appear after. If the user closes the connection
 *  selection modal, your modal will no longer appear, even if they connect Keplr later.
 *
 * @param actionButtonProps Props for the user action `<Button />` that will be replaced with a "Connect Wallet" button.
 * @param onRequestClose Required callback to request this modal to be popped from `react-modal`. Use to set modal state to `null`/`false`.
 * @returns {showModalBase, accountActionButton}
 */
export function useConnectWalletModalRedirect(
  actionButtonProps: ComponentProps<typeof Button>,
  onRequestClose: () => void
) {
  const keplr = useKeplr();
  const { accountStore, chainStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const osmosisAccount = accountStore.getAccount(chainId);

  const [walletInitiallyConnected] = useState(
    () => osmosisAccount.walletStatus === WalletStatus.Loaded
  );
  const [showSelf, setShowSelf] = useState(true);

  useEffect(() => {
    if (
      !walletInitiallyConnected &&
      osmosisAccount.walletStatus === WalletStatus.Loaded
    ) {
      setShowSelf(true);
    }
    // eslint-disable-next-line
  }, [osmosisAccount.walletStatus]);

  // prevent ibc-transfer dialog from randomly appearing if they connect wallet later
  useEffect(() => {
    if (keplr) {
      // getKeplr resolves to an exception when connection-selection modal is closed
      keplr.getKeplr().catch(() => {
        // the user set their preference: don't connect
        onRequestClose?.();
      });
    }
    // eslint-disable-next-line
  }, []);

  return {
    showModalBase: showSelf,
    accountActionButton:
      osmosisAccount.walletStatus === WalletStatus.Loaded ? (
        <Button {...actionButtonProps}>{actionButtonProps.children}</Button>
      ) : (
        <Button
          className={actionButtonProps.className}
          color={actionButtonProps.color}
          size={actionButtonProps.size}
          type={actionButtonProps.type}
          onClick={() => {
            osmosisAccount.init(); // show select connect modal
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
            Connect Wallet
          </h6>
        </Button>
      ),
  };
}
