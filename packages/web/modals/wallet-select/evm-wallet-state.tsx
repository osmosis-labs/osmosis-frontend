import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";

import { Button } from "~/components/ui/button";
import { ConnectingWalletState } from "~/components/wallet-states";
import { ErrorWalletState } from "~/components/wallet-states";
import { useTranslation } from "~/hooks";
import { ConnectEvmWalletReturn } from "~/hooks/evm-wallet";
import { WalletSelectModalProps } from "~/modals/wallet-select";
import { OnConnectWallet } from "~/modals/wallet-select/utils";

export const EvmWalletState: FunctionComponent<
  Pick<WalletSelectModalProps, "onRequestClose"> & {
    onConnect: OnConnectWallet;
    connector: ConnectEvmWalletReturn["connectors"][number];
    status: ConnectEvmWalletReturn["status"];
    error: ConnectEvmWalletReturn["error"];
  }
> = observer(({ onRequestClose, onConnect, connector, status, error }) => {
  const { t } = useTranslation();

  if (status === "success") {
    onRequestClose();
  }

  if (status === "error" && error?.name !== "UserRejectedRequestError") {
    let message = error?.message;

    if (error?.name === "ConnectorAlreadyConnectedError") {
      message = t("walletSelect.connectionInProgress");
    }

    return (
      <ErrorWalletState
        walletLogo={
          typeof connector.icon === "string" ? connector.icon : undefined
        }
        title={t("walletSelect.somethingWentWrong")}
        desc={message}
        actions={
          <Button
            onClick={() => onConnect({ wallet: connector, walletType: "evm" })}
          >
            {t("walletSelect.reconnect")}
          </Button>
        }
      />
    );
  }

  if (status === "error" && error?.name === "UserRejectedRequestError") {
    return (
      <ErrorWalletState
        walletLogo={
          typeof connector.icon === "string" ? connector.icon : undefined
        }
        title={t("walletSelect.requestRejected")}
        desc={t("walletSelect.connectionDenied")}
        actions={
          <Button
            onClick={() => onConnect({ wallet: connector, walletType: "evm" })}
          >
            {t("walletSelect.reconnect")}
          </Button>
        }
      />
    );
  }

  if (status === "loading") {
    let title = t("walletSelect.connectingWallet");
    let desc = t("walletSelect.openExtension", {
      walletName: connector?.name ?? "",
    });

    return (
      <ConnectingWalletState
        walletLogo={
          typeof connector.icon === "string" ? connector.icon : undefined
        }
        title={title}
        desc={desc}
      />
    );
  }

  return <></>;
});
