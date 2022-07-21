import dynamic from "next/dynamic";
import { FunctionComponent, Suspense } from "react";
import { observer } from "mobx-react-lite";
import { TransferPlaceholder } from "../components/complex/transfer";
import type { SourceChainKey } from "../integrations/bridge-info";
import type { EthClient } from "../integrations/ethereum";
import type { Client } from "../integrations/wallets";
import { IBCBalance } from "../stores/assets";
import { ModalBaseProps, ModalBase } from "./base";

const AxelarTransfer = dynamic(
  () => import("../integrations/axelar/transfer"),
  { suspense: true, ssr: false }
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
> = observer((props) => {
  const { balance, sourceChainKey, client } = props;
  if (!balance.originBridgeInfo) {
    return null;
  }
  const { bridge } = balance.originBridgeInfo;

  return (
    <ModalBase {...props}>
      {(() => {
        switch (bridge) {
          case "axelar":
            return (
              <Suspense
                fallback={<TransferPlaceholder isWithdraw={props.isWithdraw} />}
              >
                <AxelarTransfer
                  isWithdraw={props.isWithdraw}
                  client={client as EthClient}
                  balanceOnOsmosis={balance}
                  {...balance.originBridgeInfo}
                  selectedSourceChainKey={sourceChainKey}
                />
              </Suspense>
            );
            break;
          default:
            return null;
        }
      })()}
    </ModalBase>
  );
});
