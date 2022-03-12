import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./index";
import { WalletStatus } from "@keplr-wallet/stores";
import { useKeplr } from "../hooks";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";

export const AccountInitManagement: FunctionComponent = observer(
  ({ children }) => {
    const store = useStore();

    const keplr = useKeplr();

    const chainInfo = store?.chainStore.osmosis;
    const account = chainInfo
      ? store?.accountStore.getAccount(chainInfo.chainId)
      : undefined;

    const [accountHasInit, setAccountHasInit] = useState(false);

    useEffect(() => {
      if (typeof localStorage !== "undefined" && account) {
        const value = localStorage.getItem("account_auto_connect");
        if (value) {
          if (value === "wallet-connect") {
            keplr.setDefaultConnectionType("wallet-connect");
          } else {
            keplr.setDefaultConnectionType("extension");
          }
          account.init();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account]);

    useEffect(() => {
      if (account && account.walletStatus === WalletStatus.Loaded) {
        setAccountHasInit(true);
        if (typeof localStorage !== "undefined") {
          const value =
            keplr.connectionType === "wallet-connect"
              ? "wallet-connect"
              : "extension";
          localStorage.setItem("account_auto_connect", value);
        }
      }

      if (
        account &&
        accountHasInit &&
        account.walletStatus === WalletStatus.NotInit
      ) {
        setAccountHasInit(false);
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("account_auto_connect");
        }
        keplr.getKeplr().then((keplrAPI) => {
          if (keplrAPI && keplrAPI instanceof KeplrWalletConnectV1) {
            keplrAPI.connector.killSession();
          }

          keplr.clearLastUsedKeplr();
          keplr.setDefaultConnectionType(undefined);
        });
      }

      if (
        account?.walletStatus === WalletStatus.Rejected ||
        account?.walletStatus === WalletStatus.NotExist
      ) {
        account.disconnect();
      }
    }, [account, account?.walletStatus, accountHasInit, keplr]);

    return <React.Fragment>{children}</React.Fragment>;
  }
);
