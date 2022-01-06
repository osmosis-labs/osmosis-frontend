import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { WalletStatus } from "@keplr-wallet/stores";

export const AccountInitManagementProvider: FunctionComponent = observer(
  ({ children }) => {
    const { chainStore, accountStore } = useStore();

    const chainInfo = chainStore.osmosis;
    const account = accountStore.getAccount(chainInfo.chainId);

    const [accountHasInit, setAccountHasInit] = useState(false);

    useEffect(() => {
      if (typeof localStorage !== "undefined") {
        if (localStorage.getItem("account_auto_connect")) {
          account.init();
        }
      }
    }, [account]);

    useEffect(() => {
      if (account.walletStatus === WalletStatus.Loaded) {
        setAccountHasInit(true);
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("account_auto_connect", "true");
        }
      }

      if (accountHasInit && account.walletStatus === WalletStatus.NotInit) {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("account_auto_connect");
        }
      }

      if (
        account.walletStatus === WalletStatus.Rejected ||
        account.walletStatus === WalletStatus.NotExist
      ) {
        account.disconnect();
      }
    }, [account, account.walletStatus, accountHasInit]);

    return <React.Fragment>{children}</React.Fragment>;
  }
);
