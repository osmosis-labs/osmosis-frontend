import dynamic from "next/dynamic";
import { FunctionComponent } from "react";
import type { SourceChainKey } from "../integrations/bridge-info";
import type { EthWallet } from "../integrations/ethereum";
import type { Wallet } from "../integrations/wallets";
import { IBCBalance } from "../stores/assets";
import { ModalBaseProps, ModalBase } from "./base";

const AxelarTransfer = dynamic(
  () => import("../integrations/axelar/transfer"),
  { ssr: false }
);

/** Modal that lets user transfer via non-IBC bridges. */
export const BridgeTransferModal: FunctionComponent<
  ModalBaseProps & {
    isWithdraw: boolean;
    balance: IBCBalance;
    /** Selected network key. */
    sourceChainKey: SourceChainKey;
    walletClient: Wallet;
    onRequestSwitchWallet: () => void;
  }
> = (props) => {
  const {
    isWithdraw,
    balance,
    sourceChainKey,
    walletClient,
    onRequestClose,
    onRequestSwitchWallet,
  } = props;
  if (!balance.originBridgeInfo) {
    console.error("BridgeTransferModal given unconfigured IBC balance/asset");
    return null;
  }
  const { bridge } = balance.originBridgeInfo;

  return (
    <ModalBase
      {...props}
      title={
        isWithdraw
          ? `Withdraw ${balance.balance.currency.coinDenom}`
          : `Deposit ${balance.balance.currency.coinDenom}`
      }
    >
      {(() => {
        switch (bridge) {
          case "axelar":
            return (
              <AxelarTransfer
                isWithdraw={isWithdraw}
                ethWalletClient={walletClient as EthWallet}
                balanceOnOsmosis={balance}
                {...balance.originBridgeInfo}
                selectedSourceChainKey={sourceChainKey}
                onRequestClose={onRequestClose}
                onRequestSwitchWallet={onRequestSwitchWallet}
              />
            );
          default:
            return null;
        }
      })()}
    </ModalBase>
  );
};
