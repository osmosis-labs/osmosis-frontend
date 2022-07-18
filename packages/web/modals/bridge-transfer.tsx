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
    balance: IBCBalance;
    /** Selected network ke. */
    sourceChainKey: SourceChainKey;
    client: Client;
  }
> = (props) => {
  const { balance, sourceChainKey, client } = props;
  if (!balance.originBridgeInfo) {
    return null;
  }
  const { bridge } = balance.originBridgeInfo;
  // TODO: switch on which bridge is being used
  return (
    <ModalBase {...props}>
      {(() => {
        switch (bridge) {
          case "axelar":
            return (
              <AxelarTransfer
                isWithdraw={true}
                client={client as EthClient}
                {...balance.originBridgeInfo}
                selectedSourceChainKey={sourceChainKey}
              />
            );
            break;
          default:
            return null;
        }
      })()}
    </ModalBase>
  );
};
