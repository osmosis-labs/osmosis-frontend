import { FunctionComponent, useState } from "react";
import { WalletCard } from "../components/cards";
import { SourceChainKey, Wallet } from "../integrations";
import { useConnectWalletModalRedirect } from "../hooks";
import { ModalBase, ModalBaseProps } from "./base";

export const ConnectNonIbcWallet: FunctionComponent<
  ModalBaseProps & {
    initiallySelectedWalletId?: string;
    desiredSourceKey?: SourceChainKey;
    isWithdraw: boolean;
    wallets: Wallet[];
    onSelectWallet: (key: string) => void;
  }
> = (props) => {
  const [selectedWalletKey, setSelectedWalletId] = useState<string | null>(
    props.initiallySelectedWalletId ?? null
  );

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      className: "h-14 md:w-full w-96 mt-3 mx-auto !px-1",
      size: "lg",
      disabled:
        props.initiallySelectedWalletId === undefined && !selectedWalletKey,
      onClick: () => {
        if (selectedWalletKey) props.onSelectWallet(selectedWalletKey);
      },
      children: <h6 className="md:text-base text-lg">Next</h6>,
    },
    props.onRequestClose,
    "Connect Wallet"
  );

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={props.isWithdraw ? "Withdraw to" : "Deposit from"}
    >
      <div className="grid grid-cols-3 md:grid-cols-2 gap-4 m-4">
        {props.wallets.map((wallet, i) => (
          <WalletCard
            key={i}
            id={wallet.key}
            {...wallet.displayInfo}
            isSelected={wallet.key === selectedWalletKey}
            onClick={() => setSelectedWalletId(wallet.key)}
          />
        ))}
      </div>
      {accountActionButton}
    </ModalBase>
  );
};
