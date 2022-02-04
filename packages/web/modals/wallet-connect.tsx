import React, { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";
import QRCode from "qrcode.react";

export const KeplrWalletConnectQRModal: FunctionComponent<
  ModalBaseProps & {
    uri: string;
  }
> = ({ isOpen, onRequestClose, uri }) => {
  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-w-[35.5rem]"
      title={<h5 className="mb-4">Scan QR Code</h5>}
    >
      {uri ? (
        <div className="bg-white-high p-3.5">
          <QRCode size={500} value={uri} />
        </div>
      ) : undefined}
    </ModalBase>
  );
};
