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
import { useTranslation } from "react-multi-lang";

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
  const t = useTranslation();

  const selectedWallet = props.wallets.find(
    (w) => w.key === selectedAssetSourceKey
  );
  const canOnboardSelectedWallet =
    selectedWallet && !selectedWallet.isInstalled && selectedWallet.onboard;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      className: "mt-3 mx-auto",
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
      children: canOnboardSelectedWallet
        ? t("assets.selectAssetSource.installWallet", {
            walletName: selectedWallet.displayInfo.displayName,
          })
        : t("assets.selectAssetSource.next"),
    },
    props.onRequestClose,
    t("connectWallet")
  );

  return (
    <ModalBase
      {...props}
      isOpen={props.isOpen && showModalBase}
      title={
        props.isWithdraw
          ? t("assets.selectAssetSource.titleWithdraw")
          : t("assets.selectAssetSource.titleDeposit")
      }
    >
      <div className="m-4 grid grid-cols-3 gap-4 md:grid-cols-2">
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
