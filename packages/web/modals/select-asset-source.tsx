import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { AssetSourceCard } from "../components/cards";
import {
  FiatRampKey,
  SourceChainKey,
  Wallet,
  FiatRampDisplayInfos,
} from "../integrations";
import { useConnectWalletModalRedirect } from "../hooks";
import { ModalBase, ModalBaseProps } from "./base";

/** Prompts user to connect from a list of wallets. Will onboard a user for an uninstalled wallet if the functionality is available. */
export const SelectAssetSourceModal: FunctionComponent<
  ModalBaseProps & {
    initiallySelectedWalletId?: string;
    desiredSourceKey?: SourceChainKey;
    isWithdraw: boolean;
    wallets: Wallet[];
    fiatRamps?: FiatRampKey[];
    onSelectSource: (key: string) => void;
  }
> = observer((props) => {
  const [selectedAssetSourceKey, setSelectedAssetSourceKey] = useState<
    string | null
  >(props.initiallySelectedWalletId ?? null);

  const selectedWallet = props.wallets.find(
    (w) => w.key === selectedAssetSourceKey
  );
  const canOnboardSelectedWallet =
    selectedWallet && !selectedWallet.isInstalled && selectedWallet.onboard;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      className: "h-14 md:w-full w-96 mt-3 mx-auto !px-1",
      size: "lg",
      disabled:
        props.initiallySelectedWalletId === undefined &&
        !selectedAssetSourceKey,
      onClick: () => {
        if (canOnboardSelectedWallet) {
          selectedWallet!.onboard?.();
        } else if (selectedAssetSourceKey) {
          props.onSelectSource(selectedAssetSourceKey);
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
      title={props.isWithdraw ? "Withdraw to" : "Deposit from"}
    >
      <div className="grid grid-cols-3 md:grid-cols-2 gap-4 m-4">
        {props.wallets.map((wallet, index) => (
          <AssetSourceCard
            key={index}
            id={wallet.key}
            {...wallet.displayInfo}
            isConnected={wallet.isConnected}
            isSelected={wallet.key === selectedAssetSourceKey}
            onClick={() => setSelectedAssetSourceKey(wallet.key)}
          />
        ))}
        {props.fiatRamps?.map((fiatRampKey, index) => (
          <AssetSourceCard
            key={index}
            id={fiatRampKey}
            {...FiatRampDisplayInfos[fiatRampKey]}
            isSelected={fiatRampKey === selectedAssetSourceKey}
            onClick={() => setSelectedAssetSourceKey(fiatRampKey)}
          />
        ))}
      </div>
      {accountActionButton}
    </ModalBase>
  );
});
