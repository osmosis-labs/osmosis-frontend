import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./index";
import { getKeplrFromWindow, WalletStatus } from "@keplr-wallet/stores";
import { useKeplr } from "../hooks";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";
import { useAmplitudeAnalytics } from "../hooks/use-amplitude-analytics";

/** Manages the initialization of the Osmosis account. */
export const AccountInitManagement: FunctionComponent = observer(
  ({ children }) => {
    const { chainStore, accountStore } = useStore();
    const { setUserProperty } = useAmplitudeAnalytics();

    const keplr = useKeplr();

    const chainInfo = chainStore.osmosis;
    const account = accountStore.getAccount(chainInfo.chainId);

    const [accountHasInit, setAccountHasInit] = useState(false);

    useEffect(() => {
      // Initially, try to get keplr from window, and keplr's mode is "mobile-web",
      // it means that user enters the website via keplr app's in app browser.
      // And, it means explicitly press the osmosis button on the keplr's dApps introduction page.
      // So, try to init account immediately.
      getKeplrFromWindow().then((keplr) => {
        if (keplr && keplr.mode === "mobile-web") {
          account.init();
          setUserProperty("isWalletConnected", true);
        }
      });
    }, []);

    // Init Osmosis account w/ desired connection type (wallet connect, extension)
    // if prev connected Keplr in this browser.
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
          setUserProperty("isWalletConnected", true);
          setUserProperty("connectedWallet", value);
        }
      }
    }, []);

    const listenWCDisconnectEventOnce = useRef(false);
    useEffect(() => {
      if (account.walletStatus === WalletStatus.Loaded) {
        account.getKeplr().then((keplr) => {
          // For WalletConnect, all accounts are released at "disconnect" event
          // TODO: Disconnection of WalletConnect is handled here,
          //       but most of the logic for WalletConnect is in the `useKeplr()` hook.
          //       WalletConnect related logic should be modified so that it can be in one place.
          if (keplr instanceof KeplrWalletConnectV1) {
            if (!listenWCDisconnectEventOnce.current) {
              listenWCDisconnectEventOnce.current = true;

              keplr.connector.on("disconnect", () => {
                chainStore.chainInfos.forEach((chainInfo) => {
                  if (accountStore.hasAccount(chainInfo.chainId)) {
                    accountStore.getAccount(chainInfo.chainId).disconnect();
                    setUserProperty("isWalletConnected", false);
                  }
                });
              });
            }
          }
        });
      }
    }, [account, account.walletStatus, accountStore, chainStore.chainInfos]);

    // React to changes in Osmosis account state; store desired connection type in browser
    // clear Keplr sessions, disconnect account.
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
            keplrAPI.connector.killSession().catch((e) => {
              console.error(e);
            });
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
