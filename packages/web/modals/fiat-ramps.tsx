import { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";
import { FiatRampKey } from "../integrations";
import { Transak } from "../integrations/transak";

export const FiatRampsModal: FunctionComponent<
  { fiatRampKey: FiatRampKey } & ModalBaseProps
> = (props) => (
  <ModalBase {...props} overlayClassName="!hidden">
    {(() => {
      switch (props.fiatRampKey) {
        case "transak":
          return (
            <Transak
              onRequestClose={props.onRequestClose}
              showTransakModalOnMount={true}
            />
          );
        default:
          return null;
      }
    })()}
  </ModalBase>
);
