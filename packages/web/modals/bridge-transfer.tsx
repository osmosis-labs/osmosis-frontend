import dynamic from "next/dynamic";
import { FunctionComponent } from "react";
import type { SourceChainKey } from "../integrations/bridge-info";
import type { EthClient } from "../integrations/ethereum";
import type { Client } from "../integrations/wallets";
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
    client: Client;
  }
> = (props) => {
  const { isWithdraw, balance, sourceChainKey, client, onRequestClose } = props;
  if (!balance.originBridgeInfo) {
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
                client={client as EthClient}
                balanceOnOsmosis={balance}
                {...balance.originBridgeInfo}
                selectedSourceChainKey={sourceChainKey}
                onRequestClose={onRequestClose}
              />
            );
          default:
            return null;
        }
      })()}
    </ModalBase>
  );
};
