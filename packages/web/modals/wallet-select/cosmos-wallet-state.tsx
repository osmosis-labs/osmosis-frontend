import { WalletRepo } from "@cosmos-kit/core";
import { WalletConnectionInProgressError } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { observer } from "mobx-react-lite";
import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
} from "react";
import { useLocalStorage } from "react-use";

import { IntroducingOneClick } from "~/components/one-click-trading/introducing-one-click-trading";
import { OneClickFloatingBannerDoNotShowKey } from "~/components/one-click-trading/one-click-floating-banner";
import OneClickTradingConnectToContinue from "~/components/one-click-trading/one-click-trading-connect-to-continue";
import OneClickTradingSettings from "~/components/one-click-trading/one-click-trading-settings";
import OneClickTradingWelcomeBack from "~/components/one-click-trading/one-click-trading-welcome-back";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { Button } from "~/components/ui/button";
import { ConnectingWalletState } from "~/components/wallet-states";
import { ErrorWalletState } from "~/components/wallet-states";
import { CosmosWalletRegistry } from "~/config";
import { useFeatureFlags, useTranslation, WalletSelectOption } from "~/hooks";
import { useHasInstalledCosmosWallets } from "~/hooks/use-has-installed-wallets";
import { WalletSelectModalProps } from "~/modals/wallet-select";
import { ModalView, OnConnectWallet } from "~/modals/wallet-select/utils";
import { useStore } from "~/stores";

import QRCodeView from "./qr-code-view";
import { WalletTutorial } from "./wallet-tutorial";

enum WalletSelect1CTScreens {
  Introduction = "Introduction",
  Settings = "Settings",
  WelcomeBack = "WelcomeBack",
  ConnectAWallet = "ConnectAWallet",
}

export const CosmosWalletState: FunctionComponent<
  Pick<WalletSelectModalProps, "onRequestClose"> & {
    walletRepo: WalletRepo | undefined;
    transaction1CTParams: OneClickTradingTransactionParams | undefined;
    setTransaction1CTParams: Dispatch<
      SetStateAction<OneClickTradingTransactionParams | undefined>
    >;
    isLoading1CTParams?: boolean;
    modalView: ModalView;
    lazyWalletInfo?: (typeof CosmosWalletRegistry)[number];
    onConnect: OnConnectWallet;
    onCreate1CTSession: () => void;
    show1CTConnectAWallet: boolean;
    setShow1CTConnectAWallet: Dispatch<SetStateAction<boolean>>;
    show1CTEditParams: boolean;
    setShow1CTEditParams: Dispatch<SetStateAction<boolean>>;
    walletOptions: WalletSelectOption[];
  }
> = observer(
  ({
    walletRepo,
    onRequestClose,
    modalView,
    onConnect,
    lazyWalletInfo,
    transaction1CTParams,
    setTransaction1CTParams,
    isLoading1CTParams,
    onCreate1CTSession,
    show1CTConnectAWallet,
    setShow1CTConnectAWallet,
    show1CTEditParams,
    setShow1CTEditParams,
  }) => {
    const { t } = useTranslation();
    const { accountStore, chainStore } = useStore();
    const featureFlags = useFeatureFlags();
    const hasInstalledWallets = useHasInstalledCosmosWallets();
    const [, setDoNotShow1CTFloatingBanner] = useLocalStorage(
      OneClickFloatingBannerDoNotShowKey
    );

    const show1CT =
      hasInstalledWallets &&
      featureFlags.oneClickTrading &&
      walletRepo?.chainRecord.chain.chain_name === chainStore.osmosis.chainName;

    const currentWallet = walletRepo?.current;
    const walletInfo = currentWallet?.walletInfo ?? lazyWalletInfo;

    useEffect(() => {
      /**
       * If the user has already viewed the 1CT introduction during
       * the wallet selection process, then don't display the 1CT
       * banner when they connect to their wallet.
       */
      if (show1CT && modalView === "list") {
        setDoNotShow1CTFloatingBanner(true);
      }
    }, [modalView, setDoNotShow1CTFloatingBanner, show1CT]);

    if (modalView === "connected") {
      onRequestClose();
    }

    if (modalView === "error") {
      const error = accountStore.matchError(currentWallet?.message ?? "");

      let message = error.message;

      if (error instanceof WalletConnectionInProgressError) {
        message = t("walletSelect.connectionInProgress");
      }

      return (
        <ErrorWalletState
          walletLogo={
            typeof walletInfo?.logo === "string" ? walletInfo.logo : undefined
          }
          title={t("walletSelect.somethingWentWrong")}
          desc={message}
          actions={
            <Button
              onClick={() =>
                onConnect({ wallet: currentWallet, walletType: "cosmos" })
              }
            >
              {t("walletSelect.reconnect")}
            </Button>
          }
        />
      );
    }

    if (modalView === "doesNotExist") {
      const downloadInfo = currentWallet?.downloadInfo;
      return (
        <ErrorWalletState
          walletLogo={
            typeof walletInfo?.logo === "string" ? walletInfo.logo : undefined
          }
          title={t("walletSelect.isNotInstalled", {
            walletName: walletInfo?.prettyName ?? "",
          })}
          desc={
            Boolean(downloadInfo)
              ? t("walletSelect.maybeInstalled", {
                  walletName: walletInfo?.prettyName?.toLowerCase() ?? "",
                })
              : t("walletSelect.downloadLinkNotProvided")
          }
          actions={
            Boolean(downloadInfo) && (
              <Button
                onClick={() => {
                  window.open(currentWallet?.downloadInfo?.link, "_blank");
                }}
              >
                {t("walletSelect.installWallet", {
                  walletName: walletInfo?.prettyName ?? "",
                })}
              </Button>
            )
          }
        />
      );
    }

    if (modalView === "rejected") {
      return (
        <ErrorWalletState
          walletLogo={
            typeof walletInfo?.logo === "string" ? walletInfo.logo : undefined
          }
          title={t("walletSelect.requestRejected")}
          desc={
            currentWallet?.rejectMessageTarget ??
            t("walletSelect.connectionDenied")
          }
          actions={
            <Button
              onClick={() =>
                onConnect({ wallet: currentWallet, walletType: "cosmos" })
              }
            >
              {t("walletSelect.reconnect")}
            </Button>
          }
        />
      );
    }

    if (modalView === "initializeOneClickTradingError") {
      const title = t("walletSelect.errorInitializingOneClickTradingSession");
      const desc = t("walletSelect.retryInWalletOrContinue", {
        walletName: walletInfo?.prettyName ?? "",
      });

      return (
        <ErrorWalletState
          walletLogo={
            typeof walletInfo?.logo === "string" ? walletInfo.logo : undefined
          }
          title={title}
          desc={desc}
          actions={
            <div className="flex flex-col gap-2">
              <Button onClick={() => onCreate1CTSession()} className="!w-full">
                {t("walletSelect.retry")}
              </Button>
              <Button
                variant="outline"
                onClick={() => onRequestClose()}
                className="!w-full"
              >
                {t("walletSelect.continueWithoutOneClickTrading")}
              </Button>
            </div>
          }
        />
      );
    }

    if (
      modalView === "initializingOneClickTrading" ||
      modalView === "broadcastedOneClickTrading"
    ) {
      const title =
        modalView === "broadcastedOneClickTrading"
          ? t("walletSelect.enablingOneClickTrading")
          : t("walletSelect.approveOneClickTradingSession", {
              walletName: walletInfo?.prettyName ?? "",
            });

      return (
        <ConnectingWalletState
          walletLogo={
            typeof walletInfo?.logo === "string" ? walletInfo.logo : undefined
          }
          title={title}
        />
      );
    }

    if (modalView === "connecting") {
      const message = currentWallet?.message;

      let title: string = t("walletSelect.connectingWallet");
      let desc: string =
        walletInfo?.mode === "wallet-connect"
          ? t("walletSelect.approveWalletConnect", {
              walletName: walletInfo?.prettyName ?? "",
            })
          : t("walletSelect.openExtension", {
              walletName: walletInfo?.prettyName ?? "",
            });

      if (message === "InitClient" || Boolean(lazyWalletInfo)) {
        title = t("walletSelect.initializingWallet");
        desc = "";
      }

      return (
        <ConnectingWalletState
          walletLogo={
            typeof walletInfo?.logo === "string" ? walletInfo.logo : undefined
          }
          title={title}
          desc={desc}
        />
      );
    }

    if (modalView === "qrCode") {
      return <QRCodeView wallet={currentWallet!} />;
    }

    let oneClickTradingScreen: WalletSelect1CTScreens;
    if (show1CTConnectAWallet) {
      oneClickTradingScreen = WalletSelect1CTScreens.ConnectAWallet;
    } else if (show1CTEditParams) {
      oneClickTradingScreen = WalletSelect1CTScreens.Settings;
    } else if (!show1CTEditParams && accountStore.hasUsedOneClickTrading) {
      oneClickTradingScreen = WalletSelect1CTScreens.WelcomeBack;
    } else {
      oneClickTradingScreen = WalletSelect1CTScreens.Introduction;
    }

    return (
      <>
        {show1CT ? (
          <ScreenManager currentScreen={oneClickTradingScreen}>
            <Screen screenName={WalletSelect1CTScreens.Settings}>
              <OneClickTradingSettings
                classes={{
                  root: "pt-1.5",
                }}
                onGoBack={() => {
                  setShow1CTEditParams(false);
                }}
                onClose={onRequestClose}
                setTransaction1CTParams={setTransaction1CTParams}
                transaction1CTParams={transaction1CTParams!}
                onStartTrading={() => {
                  setShow1CTConnectAWallet(true);
                  setShow1CTEditParams(false);
                }}
              />
            </Screen>
            <Screen screenName={WalletSelect1CTScreens.ConnectAWallet}>
              <OneClickTradingConnectToContinue />
            </Screen>
            <Screen screenName={WalletSelect1CTScreens.WelcomeBack}>
              <div className="flex flex-col px-8 pt-14">
                <OneClickTradingWelcomeBack
                  setTransaction1CTParams={setTransaction1CTParams}
                  transaction1CTParams={transaction1CTParams}
                  onClickEditParams={() => {
                    setShow1CTEditParams(true);
                  }}
                  isLoading={isLoading1CTParams}
                  isDisabled={!transaction1CTParams}
                />
              </div>
            </Screen>
            <Screen screenName={WalletSelect1CTScreens.Introduction}>
              <div className="flex flex-col px-8">
                <IntroducingOneClick
                  onStartTrading={() => {
                    setShow1CTConnectAWallet(true);

                    setTransaction1CTParams((prev) => {
                      if (!prev)
                        throw new Error("transaction1CTParams is undefined");
                      return { ...prev, isOneClickEnabled: true };
                    });
                  }}
                  onClickEditParams={() => {
                    setShow1CTEditParams(true);
                  }}
                  isLoading={isLoading1CTParams}
                  isDisabled={!transaction1CTParams}
                />
              </div>
            </Screen>
          </ScreenManager>
        ) : (
          <WalletTutorial />
        )}
      </>
    );
  }
);
