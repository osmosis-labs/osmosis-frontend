import {
  isAndroid,
  isMobile as isMobileWC,
  saveMobileLinkInfo,
} from "@walletconnect/browser-utils";
import dynamic from "next/dynamic";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";

import { Button } from "~/components/buttons";
import { useWindowSize } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";

export const WalletConnectQRModal: FunctionComponent<
  ModalBaseProps & {
    uri: string;
  }
> = ({ isOpen, onRequestClose, uri }) => {
  // Below is used for styling for mobile device.
  // Check the size of window.
  const { isMobile } = useWindowSize();

  // Below is used for real mobile environment.
  // Check the user agent.
  const [checkMobile] = useState(() => isMobileWC());
  const [checkAndroid] = useState(() => isAndroid());

  const navigateToAppURL = useMemo(() => {
    if (!uri) {
      return;
    }

    if (checkMobile) {
      if (checkAndroid) {
        // Save the mobile link.
        saveMobileLinkInfo({
          name: "Keplr",
          href: "intent://wcV1#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;",
        });

        return `intent://wcV1?${uri}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;`;
      } else {
        // Save the mobile link.
        saveMobileLinkInfo({
          name: "Keplr",
          href: "keplrwallet://wcV1",
        });

        return `keplrwallet://wcV1?${uri}`;
      }
    }
  }, [checkAndroid, checkMobile, uri]);

  useEffect(() => {
    // Try opening the app without interaction.
    if (navigateToAppURL) {
      window.location.href = navigateToAppURL;
    }
  }, [navigateToAppURL]);

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-w-[35.5rem]"
      title={
        checkMobile ? (
          <h6 className="mb-4">Open App</h6>
        ) : (
          <h5 className="mb-4">Scan QR Code</h5>
        )
      }
    >
      {uri ? (
        !checkMobile ? (
          (() => {
            const QRCode = dynamic(() => import("qrcode.react"));

            return (
              <div className="bg-white-high p-3.5 md:mx-auto md:w-80">
                <QRCode size={isMobile ? 290 : 480} value={uri} />
              </div>
            );
          })()
        ) : (
          <Button
            className="my-3 py-4"
            onClick={() => {
              if (navigateToAppURL) {
                window.location.href = navigateToAppURL;
              }
            }}
          >
            Open App
          </Button>
        )
      ) : undefined}
    </ModalBase>
  );
};
