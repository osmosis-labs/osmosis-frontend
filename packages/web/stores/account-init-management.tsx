import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./index";
import { WalletStatus } from "@keplr-wallet/stores";
import { useKeplr } from "../hooks";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";

export const AccountInitManagement: FunctionComponent = observer(
  ({ children }) => {
    const { chainStore, accountStore } = useStore();

    const keplr = useKeplr();

    const chainInfo = chainStore.osmosis;
    const account = accountStore.getAccount(chainInfo.chainId);

    const [accountHasInit, setAccountHasInit] = useState(false);

    useEffect(() => {
      if (typeof localStorage !== "undefined") {
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
    }, []);

    useEffect(() => {
      if (account.walletStatus === WalletStatus.Loaded) {
        setAccountHasInit(true);
        if (typeof localStorage !== "undefined") {
          const value =
            keplr.connectionType === "wallet-connect"
              ? "wallet-connect"
              : "extension";
          localStorage.setItem("account_auto_connect", value);
        }
      }

      if (accountHasInit && account.walletStatus === WalletStatus.NotInit) {
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
        account.walletStatus === WalletStatus.Rejected ||
        account.walletStatus === WalletStatus.NotExist
      ) {
        account.disconnect();
      }
    }, [account, account.walletStatus, accountHasInit, keplr]);

    return <React.Fragment>{children}</React.Fragment>;
  }
);
