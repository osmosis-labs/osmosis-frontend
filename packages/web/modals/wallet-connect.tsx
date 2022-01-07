import React, { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";
import QRCode from "qrcode.react";

export const KeplrWalletConnectQRModal: FunctionComponent<
  ModalBaseProps & {
    uri: string;
  }
> = ({ isOpen, onRequestClose, uri }) => {
  return (
    <ModalBase isOpen={isOpen} onRequestClose={onRequestClose}>
      {uri ? (
        <div className="bg-white-high p-2">
          <QRCode size={500} value={uri} />
        </div>
      ) : undefined}
    </ModalBase>
  );
};
