import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import { FunctionComponent } from "react";

import { IS_TESTNET } from "~/config";
import { useTranslation } from "~/hooks";
import { useConnectWalletModalRedirect } from "~/hooks";
import type { SourceChainKey } from "~/integrations/bridge-info";
import type { EthWallet } from "~/integrations/ethereum";
import type { ObservableWallet } from "~/integrations/wallets";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { IBCBalance } from "~/stores/assets";

const AxelarTransfer = dynamic(() => import("~/integrations/axelar/transfer"), {
  ssr: false,
});

const NomicTransfer = dynamic(() => import("~/integrations/nomic/transfer"), {
  ssr: false,
});

export type BridgeIntegrationProps = {
  connectCosmosWalletButtonOverride?: JSX.Element;
};

/** Modal that lets user transfer via non-IBC bridges. */
export const BridgeTransferModal: FunctionComponent<
  ModalBaseProps & {
    isWithdraw: boolean;
    balance: IBCBalance;
    /** Selected network key. */
    sourceChainKey: SourceChainKey;
    walletClient: ObservableWallet | undefined;
    onRequestSwitchWallet: () => void;
  }
> = observer((props) => {
  const {
    isWithdraw,
    balance,
    sourceChainKey,
    walletClient,
    onRequestClose,
    onRequestSwitchWallet,
    className,
  } = props;
  const { t } = useTranslation();
  const {
    showModalBase,
    accountActionButton: connectWalletButton,
    walletConnected,
  } = useConnectWalletModalRedirect(
    {
      className: "md:w-full w-2/3 md:p-4 p-6 hover:opacity-75 rounded-2xl",
      onClick: () => {},
    },
    props.onRequestClose
  );

  if (!balance.originBridgeInfo) {
    console.error("BridgeTransferModal given unconfigured IBC balance/asset");
    return null;
  }
  const { bridge } = balance.originBridgeInfo;

  const sourceChainConfig = balance.originBridgeInfo.sourceChainTokens.find(
    ({ id }) => id === sourceChainKey
  );

  return (
    <ModalBase
      {...props}
      className={classNames(className, { "w-auto": bridge === "nomic" })}
      title={
        isWithdraw
          ? bridge === "axelar" &&
            Boolean(sourceChainConfig?.nativeWrapEquivalent)
            ? t("assets.transferAssetSelect.withdraw")
            : t("assets.transfer.titleWithdraw", {
                coinDenom:
                  bridge === "nomic"
                    ? "BTC"
                    : balance.balance.currency.coinDenom,
              })
          : bridge === "axelar" &&
            Boolean(sourceChainConfig?.nativeWrapEquivalent)
          ? t("assets.transferAssetSelect.deposit")
          : t("assets.transfer.titleDeposit", {
              coinDenom:
                bridge === "nomic" ? "BTC" : balance.balance.currency.coinDenom,
            })
      }
      isOpen={props.isOpen && showModalBase}
    >
      {(() => {
        switch (bridge) {
          case "axelar":
            return (
              <AxelarTransfer
                isWithdraw={isWithdraw}
                ethWalletClient={walletClient as unknown as EthWallet}
                balanceOnOsmosis={balance}
                {...balance.originBridgeInfo}
                selectedSourceChainKey={sourceChainKey}
                onRequestClose={onRequestClose}
                onRequestSwitchWallet={onRequestSwitchWallet}
                connectCosmosWalletButtonOverride={
                  walletConnected ? undefined : connectWalletButton
                }
                isTestNet={IS_TESTNET}
              />
            );
          case "nomic":
            return (
              <NomicTransfer
                balanceOnOsmosis={balance}
                isWithdraw={isWithdraw}
                onRequestClose={onRequestClose}
                onRequestSwitchWallet={onRequestSwitchWallet}
                selectedSourceChainKey={sourceChainKey}
                connectCosmosWalletButtonOverride={
                  walletConnected ? undefined : connectWalletButton
                }
                isTestNet={IS_TESTNET}
              />
            );
          default:
            return null;
        }
      })()}
    </ModalBase>
  );
});
