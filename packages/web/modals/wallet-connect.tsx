import dynamic from "next/dynamic";
import React, { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";
import { useWindowSize } from "../hooks";

export const KeplrWalletConnectQRModal: FunctionComponent<
  ModalBaseProps & {
    uri: string;
  }
> = ({ isOpen, onRequestClose, uri }) => {
  const { isMobile } = useWindowSize();

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-w-[35.5rem]"
      title={
        isMobile ? (
          <h6 className="mb-4">Scan QR Code</h6>
        ) : (
          <h5 className="mb-4">Scan QR Code</h5>
        )
      }
    >
      {uri
        ? (() => {
            const QRCode = dynamic(() => import("qrcode.react"));

            return (
              <div className="bg-white-high p-3.5 md:w-80 md:mx-auto">
                <QRCode size={isMobile ? 290 : 480} value={uri} />
              </div>
            );
          })()
        : undefined}
    </ModalBase>
  );
};
