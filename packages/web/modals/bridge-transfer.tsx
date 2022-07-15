import { FunctionComponent } from "react";
import { OriginBridgeInfo } from "../integrations/bridge-info";
import { ModalBaseProps, ModalBase } from "./base";

/** Modal that lets user transfer via non-IBC bridges. */
export const BridgeTransferModal: FunctionComponent<
  ModalBaseProps & OriginBridgeInfo
> = (props) => {
  // TODO: switch on which bridge is being used
  return (
    <ModalBase {...props}>
      <div>WIP non ibc bridge transfer</div>
    </ModalBase>
  );
};
