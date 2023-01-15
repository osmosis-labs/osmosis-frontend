import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";

export const SettingsModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => {
    return (
      <ModalBase
        className="!rounded-xl !p-0"
        {...props}
        hideCloseButton
        title=""
        overlayClassName="md:-bottom-1/3"
      ></ModalBase>
    );
  }
);
