import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { WalletCard } from "../components/cards";
import { SourceChainKey, Wallet } from "../integrations";
import { useConnectWalletModalRedirect } from "../hooks";
import { ModalBase, ModalBaseProps } from "./base";

/** Prompts user to connect from a list of wallets. Will onboard a user for an uninstalled wallet if the functionality is available. */
export const ConnectNonIbcWallet: FunctionComponent<
  ModalBaseProps & {
    initiallySelectedWalletId?: string;
    desiredSourceKey?: SourceChainKey;
    isWithdraw: boolean;
    wallets: Wallet[];
    onSelectWallet: (key: string) => void;
  }
> = observer((props) => {
  const { initiallySelectedWalletId, isWithdraw, wallets, onSelectWallet } =
    props;

  const [selectedWalletKey, setSelectedWalletId] = useState<string | null>(
    initiallySelectedWalletId ?? null
  );

  const selectedWallet = wallets.find((w) => w.key === selectedWalletKey);
  const canOnboardSelectedWallet =
    selectedWallet && !selectedWallet.isInstalled && selectedWallet.onboard;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      className: "h-14 md:w-full w-96 mt-3 mx-auto !px-1",
      disabled:
        (initiallySelectedWalletId === undefined && !selectedWalletKey) ||
        wallets.length === 0,
      onClick: () => {
        if (canOnboardSelectedWallet) {
          selectedWallet!.onboard?.();
        } else if (selectedWalletKey) {
          onSelectWallet(selectedWalletKey);
        } else {
          console.error(
            "Wallet selection invalid state: selectedWalletKey undefined"
          );
        }
      },
      children: (
        <h6 className="md:text-base text-lg">
          {canOnboardSelectedWallet
            ? `Install ${selectedWallet.displayInfo.displayName}`
            : wallets.length === 0
            ? "None available"
            : "Next"}
        </h6>
      ),
    },
    props.onRequestClose,
    "Connect Wallet"
  );

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={isWithdraw ? "Withdraw to" : "Deposit from"}
    >
      <div className="grid grid-cols-3 md:grid-cols-2 gap-4 m-4">
        {props.wallets.length === 0 ? (
          <WalletCard
            className="opacity-30"
            id="placeholder"
            displayName="None"
            iconUrl="/icons/error-x.svg"
          />
        ) : (
          <>
            {wallets.map((wallet, i) => (
              <WalletCard
                key={i}
                id={wallet.key}
                {...wallet.displayInfo}
                isConnected={wallet.isConnected}
                isSelected={wallet.key === selectedWalletKey}
                onClick={() => setSelectedWalletId(wallet.key)}
              />
            ))}
          </>
        )}
      </div>
      {accountActionButton}
    </ModalBase>
  );
});
