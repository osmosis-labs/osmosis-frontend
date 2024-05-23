import {
  ChainWalletBase,
  State,
  WalletRepo,
  WalletStatus,
} from "@cosmos-kit/core";
import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
  CosmosRegistryWallet,
  WalletConnectionInProgressError,
} from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocalStorage, useUpdateEffect } from "react-use";
import { useConnect } from "wagmi";

import { Icon } from "~/components/assets";
import ClientOnly from "~/components/client-only";
import { IntroducingOneClick } from "~/components/one-click-trading/introducing-one-click-trading";
import { OneClickFloatingBannerDoNotShowKey } from "~/components/one-click-trading/one-click-floating-banner";
import OneClickTradingConnectToContinue from "~/components/one-click-trading/one-click-trading-connect-to-continue";
import OneClickTradingSettings from "~/components/one-click-trading/one-click-trading-settings";
import OneClickTradingWelcomeBack from "~/components/one-click-trading/one-click-trading-welcome-back";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { Button } from "~/components/ui/button";
import ConnectingWalletState from "~/components/wallet-states/connecting-wallet-state";
import ErrorWalletState from "~/components/wallet-states/error-wallet-state";
import { AvailableWallets, CosmosWalletRegistry } from "~/config";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import {
  CreateOneClickSessionError,
  useCreateOneClickTradingSession,
} from "~/hooks/mutations/one-click-trading";
import { useOneClickTradingParams } from "~/hooks/one-click-trading/use-one-click-trading-params";
import { useHasInstalledWallets } from "~/hooks/use-has-installed-wallets";
import { ModalBase, ModalBaseProps, ModalCloseButton } from "~/modals/base";
import { useStore } from "~/stores";

import QRCodeView from "./qr-code-view";
import WalletTutorial from "./wallet-tutorial";

type ModalView =
  | "list"
  | "qrCode"
  | "connecting"
  | "connected"
  | "error"
  | "doesNotExist"
  | "rejected"
  | "initializingOneClickTrading"
  | "broadcastedOneClickTrading"
  | "initializeOneClickTradingError";

export function getModalView({
  qrState,
  isInitializingOneClickTrading,
  hasOneClickTradingError,
  hasBroadcastedTx,
  walletStatus,
}: {
  qrState: State;
  isInitializingOneClickTrading: boolean;
  hasOneClickTradingError: boolean;
  hasBroadcastedTx: boolean;
  walletStatus?: WalletStatus;
}): ModalView {
  if (walletStatus === WalletStatus.Connecting) {
    return qrState === State.Init ? "connecting" : "qrCode";
  }

  if (walletStatus === WalletStatus.Connected) {
    if (hasOneClickTradingError) return "initializeOneClickTradingError";
    if (isInitializingOneClickTrading) {
      return hasBroadcastedTx
        ? "broadcastedOneClickTrading"
        : "initializingOneClickTrading";
    }
    return "connected";
  }

  if (walletStatus === WalletStatus.Error) {
    return qrState === State.Init ? "error" : "qrCode";
  }

  if (walletStatus === WalletStatus.Rejected) {
    return "rejected";
  }

  if (walletStatus === WalletStatus.NotExist) {
    return "doesNotExist";
  }

  return "list";
}

export const WalletSelectModal: FunctionComponent<
  ModalBaseProps & { walletRepo: WalletRepo; onConnect?: () => void }
> = observer((props) => {
  const {
    isOpen,
    onRequestClose,
    walletRepo: walletRepoProp,
    onConnect: onConnectProp,
  } = props;
  const { isMobile } = useWindowSize();
  const { accountStore, chainStore } = useStore();
  const featureFlags = useFeatureFlags();
  const hasInstalledWallets = useHasInstalledWallets();
  const [show1CTEditParams, setShow1CTEditParams] = useState(false);
  const [hasBroadcastedTx, setHasBroadcastedTx] = useState(false);

  const create1CTSession = useCreateOneClickTradingSession({
    onBroadcasted: () => {
      setHasBroadcastedTx(true);
    },
    queryOptions: {
      onSuccess: () => {
        onRequestClose();
      },
      onSettled: () => {
        setIsInitializingOneClickTrading(false);
        setHasBroadcastedTx(false);
      },
    },
  });

  const [qrState, setQRState] = useState<State>(State.Init);
  const [qrMessage, setQRMessage] = useState<string>("");
  const [modalView, setModalView] = useState<ModalView>("list");
  const [isInitializingOneClickTrading, setIsInitializingOneClickTrading] =
    useState(false);
  const [lazyWalletInfo, setLazyWalletInfo] =
    useState<(typeof CosmosWalletRegistry)[number]>();
  const [show1CTConnectAWallet, setShow1CTConnectAWallet] = useState(false);

  const hasOneClickTradingError = !!create1CTSession.error;

  const {
    transaction1CTParams,
    setTransaction1CTParams,
    isLoading: isLoading1CTParams,
    spendLimitTokenDecimals,
    reset: reset1CTParams,
  } = useOneClickTradingParams();

  const current = walletRepoProp?.current;
  const walletStatus = current?.walletStatus;
  const chainName = walletRepoProp?.chainRecord.chain?.chain_name!;

  useEffect(() => {
    if (isOpen) {
      setModalView(
        getModalView({
          qrState,
          walletStatus,
          isInitializingOneClickTrading,
          hasOneClickTradingError,
          hasBroadcastedTx,
        })
      );
    }
  }, [
    qrState,
    walletStatus,
    isOpen,
    qrMessage,
    isInitializingOneClickTrading,
    hasOneClickTradingError,
    hasBroadcastedTx,
  ]);

  useUpdateEffect(() => {
    if (!isOpen) {
      setIsInitializingOneClickTrading(false);
    }
  }, [isOpen]);

  (current?.client as any)?.setActions?.({
    qrUrl: {
      state: setQRState,
      /**
       * We need this function to avoid crashing the Cosmoskit library.
       * A PR is open with a fix for this issue.
       * @see https://github.com/cosmology-tech/cosmos-kit/pull/176
       *  */
      message: setQRMessage,
    },
  });

  const onClose = () => {
    onRequestClose();
    if (
      walletStatus === WalletStatus.Connecting ||
      walletStatus === WalletStatus.Rejected ||
      walletStatus === WalletStatus.Error
    ) {
      walletRepoProp?.disconnect();
    }
  };

  const onCreate1CTSession = async ({
    walletRepo,
    transaction1CTParams,
  }: {
    walletRepo: WalletRepo;
    transaction1CTParams: OneClickTradingTransactionParams | undefined;
  }) => {
    create1CTSession.reset();
    setIsInitializingOneClickTrading(true);
    return create1CTSession.mutate({
      walletRepo,
      transaction1CTParams,
      spendLimitTokenDecimals: spendLimitTokenDecimals,
    });
  };

  const onConnect = async (
    sync: boolean,
    wallet?: ChainWalletBase | (typeof CosmosWalletRegistry)[number]
  ) => {
    if (!wallet) return;

    if (current) {
      await current?.disconnect(true);
    }

    const handleConnectError = (e: Error) => {
      console.error("Error while connecting to wallet. Details: ", e);
      localStorage.removeItem(CosmosKitWalletLocalStorageKey);
      localStorage.removeItem(CosmosKitAccountsLocalStorageKey);
    };

    if (!("lazyInstall" in wallet)) {
      wallet
        .connect(sync)
        .then(() => {
          onConnectProp?.();
        })
        .catch(handleConnectError);
      return;
    }

    const isWalletInstalled = walletRepoProp?.wallets.some(
      ({ walletName }) => walletName === wallet.name
    );

    let walletRepo: WalletRepo;

    // if wallet is not installed, install it
    if (!isWalletInstalled && "lazyInstall" in wallet) {
      setLazyWalletInfo(wallet);
      setModalView("connecting");

      // wallet is now walletInfo
      const walletInfo = wallet;
      const WalletClass = await wallet.lazyInstall();

      const walletManager = await accountStore.addWallet(
        new WalletClass(walletInfo)
      );
      await walletManager.onMounted().catch(handleConnectError);
      setLazyWalletInfo(undefined);

      walletRepo = walletManager.getWalletRepo(chainName);
    } else {
      walletRepo = walletRepoProp;
    }

    const isOsmosisConnection = chainStore.osmosis.chainName === chainName;
    const osmosisWalletRepo = accountStore.getWalletRepo(
      chainStore.osmosis.chainName
    );

    if (
      !isOsmosisConnection &&
      osmosisWalletRepo.walletStatus !== WalletStatus.Connected
    ) {
      await osmosisWalletRepo
        .connect(wallet.name, sync)
        .catch(handleConnectError);
    }

    return walletRepo
      .connect(wallet.name, sync)
      .then(async () => {
        onConnectProp?.();

        if (transaction1CTParams?.isOneClickEnabled) {
          try {
            await onCreate1CTSession({ walletRepo, transaction1CTParams });
          } catch (e) {
            const error = e as CreateOneClickSessionError | Error;

            if (error instanceof Error) {
              throw new CreateOneClickSessionError(error.message);
            }

            throw e;
          }
        }
      })
      .catch((e: Error | unknown) => {
        if (e instanceof CreateOneClickSessionError) throw e;
        handleConnectError(
          e instanceof Error ? e : new Error("Unknown error.")
        );
      });
  };

  const onRequestBack =
    modalView !== "list"
      ? () => {
          if (
            walletStatus === WalletStatus.Connecting ||
            walletStatus === WalletStatus.Rejected ||
            walletStatus === WalletStatus.Error ||
            walletStatus === WalletStatus.Connected
          ) {
            walletRepoProp?.disconnect();
            walletRepoProp?.activate();
          }

          if (
            modalView === "initializeOneClickTradingError" ||
            modalView === "initializingOneClickTrading"
          ) {
            reset1CTParams();
            create1CTSession.reset();
            setIsInitializingOneClickTrading(false);
            setShow1CTConnectAWallet(false);
          }

          setModalView("list");
        }
      : undefined;

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      hideCloseButton
      className="max-h-[90vh] w-full max-w-[800px] overflow-hidden !px-0 py-0 sm:max-h-[80vh]"
    >
      <div
        className={classNames(
          "flex overflow-auto sm:max-h-full sm:flex-col",
          modalView === "qrCode" ? "max-h-[600px]" : "max-h-[530px]",
          hasInstalledWallets && featureFlags.oneClickTrading
            ? "min-h-[73vh]"
            : "min-h-[50vh]"
        )}
      >
        <ClientOnly
          className={classNames(
            "w-full max-w-[284px] overflow-auto sm:max-w-none sm:shrink-0 sm:bg-[rgba(20,15,52,0.2)]",
            "before:pointer-events-none before:absolute before:inset-0 before:max-w-[284px] before:bg-[rgba(20,15,52,0.2)] before:sm:hidden"
          )}
        >
          <WalletList
            onConnect={onConnect}
            walletRepo={walletRepoProp}
            isMobile={isMobile}
            modalView={modalView}
          />
        </ClientOnly>
        <div className="relative w-full overflow-auto py-8 sm:static">
          {onRequestBack && (
            <Button
              aria-label="Go Back"
              size="icon"
              variant="ghost"
              className="absolute left-6 top-6 z-50 w-fit text-osmoverse-400 hover:text-white-full"
              onClick={onClose}
            >
              <Icon id="chevron-left" width={16} height={16} />
            </Button>
          )}
          <CosmosWalletState
            {...props}
            onRequestClose={onClose}
            modalView={modalView}
            onConnect={onConnect}
            lazyWalletInfo={lazyWalletInfo}
            transaction1CTParams={transaction1CTParams}
            setTransaction1CTParams={setTransaction1CTParams}
            isLoading1CTParams={isLoading1CTParams}
            onCreate1CTSession={() =>
              onCreate1CTSession({
                walletRepo: walletRepoProp,
                transaction1CTParams,
              })
            }
            show1CTConnectAWallet={show1CTConnectAWallet}
            setShow1CTConnectAWallet={setShow1CTConnectAWallet}
            show1CTEditParams={show1CTEditParams}
            setShow1CTEditParams={setShow1CTEditParams}
          />

          {/* Hide close button since 1CT edit params will include it */}
          {!show1CTEditParams && <ModalCloseButton onClick={onClose} />}
        </div>
      </div>
    </ModalBase>
  );
});

const WalletList: FunctionComponent<
  Pick<ComponentPropsWithoutRef<typeof WalletSelectModal>, "walletRepo"> & {
    onConnect: (
      sync: boolean,
      wallet?: ChainWalletBase | (typeof CosmosWalletRegistry)[number]
    ) => void;
    isMobile: boolean;
    modalView: ModalView;
  }
> = observer(({ walletRepo, onConnect, isMobile, modalView }) => {
  const { t } = useTranslation();
  const { connectors: evmWallets } = useConnect();

  const cosmosWallets = useMemo(
    () =>
      [...CosmosWalletRegistry]
        // If mobile, filter out browser wallets
        .reduce((acc, wallet, _index, array) => {
          if (isMobile) {
            /**
             * If an extension wallet is found in mobile, this means that we are inside an app browser.
             * Therefore, we should only show that compatible extension wallet.
             * */
            if (acc.length > 0 && acc[0].name.endsWith("-extension")) {
              return acc;
            }

            const _window = window as Record<string, any>;
            const mobileWebModeName = "mobile-web";

            /**
             * If on mobile and `leap` is in `window`, it means that the user enters
             * the frontend from Leap's app in app browser. So, there is no need
             * to use wallet connect, as it resembles the extension's usage.
             */
            if (_window?.leap && _window?.leap?.mode === mobileWebModeName) {
              return array
                .filter((wallet) => wallet.name === AvailableWallets.Leap)
                .map((wallet) => ({ ...wallet, mobileDisabled: false }));
            }

            /**
             * If on mobile and `keplr` is in `window`, it means that the user enters
             * the frontend from Keplr's app in app browser. So, there is no need
             * to use wallet connect, as it resembles the extension's usage.
             */
            if (_window?.keplr && _window?.keplr?.mode === mobileWebModeName) {
              return array
                .filter((wallet) => wallet.name === AvailableWallets.Keplr)
                .map((wallet) => ({ ...wallet, mobileDisabled: false }));
            }

            /**
             * If user is in a normal mobile browser, show only wallet connect
             */
            return wallet.name.endsWith("mobile") ? [...acc, wallet] : acc;
          }

          return [...acc, wallet];
        }, [] as (typeof CosmosWalletRegistry)[number][]),
    [isMobile]
  );

  /**
   * Categorizes wallets into three distinct categories:
   * 1. Mobile Wallets: Wallets that use the "wallet-connect" mode.
   * 2. Installed Wallets: Wallets that have a defined window property present in the current window.
   * 3. Other Wallets: Wallets that do not fall into the above two categories.
   *
   * Note: The object keys are the translation keys for the category name.
   */
  const categories = useMemo(
    () =>
      Object.entries({ cosmos: cosmosWallets, evm: evmWallets }).reduce(
        (acc, [type, walletArray]) => {
          if (type === "evm") {
            (walletArray as typeof evmWallets).forEach((wallet) => {
              console.log(wallet);
              acc["walletSelect.installedWallets"].push(wallet);
              return;
            });
          }

          if (type === "cosmos") {
            (walletArray as CosmosRegistryWallet[]).forEach((wallet) => {
              if (wallet.mode === "wallet-connect") {
                acc["walletSelect.mobileWallets"].push(wallet);
                return;
              }

              if (
                wallet.windowPropertyName &&
                wallet.windowPropertyName in window
              ) {
                acc["walletSelect.installedWallets"].push(wallet);
                return;
              }

              acc["walletSelect.otherWallets"].push(wallet);
              return;
            });
          }

          return acc;
        },
        {
          "walletSelect.installedWallets":
            [] as (typeof CosmosWalletRegistry)[number][],
          "walletSelect.mobileWallets":
            [] as (typeof CosmosWalletRegistry)[number][],
          "walletSelect.otherWallets":
            [] as (typeof CosmosWalletRegistry)[number][],
        }
      ),
    [cosmosWallets, evmWallets]
  );

  return (
    <section className="flex flex-col gap-8 py-8 pl-8  sm:pl-3">
      <h1 className="z-10 text-h6 font-h6 tracking-wider sm:text-center">
        {t("connectWallet")}
      </h1>
      <div className="z-10 flex flex-col gap-8 overflow-auto pr-5">
        {Object.entries(categories)
          .filter(([_, wallets]) => wallets.length > 0)
          .map(([categoryName, wallets]) => {
            const isDisabled = modalView === "initializingOneClickTrading";
            return (
              <div key={categoryName} className="flex flex-col">
                <h2
                  className={classNames(
                    "subtitle1 text-osmoverse-100 sm:hidden",
                    isDisabled && "opacity-70"
                  )}
                >
                  {t(categoryName)}
                </h2>

                <div className="flex flex-col sm:flex-row sm:overflow-x-auto">
                  {wallets.map((wallet) => (
                    <button
                      className={classNames(
                        "button flex w-full items-center gap-3 rounded-xl px-3 font-bold text-osmoverse-100 transition-colors hover:bg-osmoverse-700",
                        "col-span-2 py-3 font-normal",
                        "sm:w-fit sm:flex-col",
                        walletRepo?.current?.walletName === wallet.name &&
                          "bg-osmoverse-700",
                        "disabled:opacity-70"
                      )}
                      key={wallet.name}
                      onClick={() => onConnect(false, wallet)}
                      disabled={isDisabled}
                    >
                      {typeof wallet.logo === "string" && (
                        <img
                          src={wallet.logo}
                          width={40}
                          height={40}
                          alt="Wallet logo"
                        />
                      )}
                      <span>{wallet.prettyName}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
});

enum WalletSelect1CTScreens {
  Introduction = "Introduction",
  Settings = "Settings",
  WelcomeBack = "WelcomeBack",
  ConnectAWallet = "ConnectAWallet",
}

const CosmosWalletState: FunctionComponent<
  Pick<
    ComponentPropsWithoutRef<typeof WalletSelectModal>,
    "walletRepo" | "onRequestClose"
  > & {
    transaction1CTParams: OneClickTradingTransactionParams | undefined;
    setTransaction1CTParams: Dispatch<
      SetStateAction<OneClickTradingTransactionParams | undefined>
    >;
    isLoading1CTParams?: boolean;
    modalView: ModalView;
    lazyWalletInfo?: (typeof CosmosWalletRegistry)[number];
    onConnect: (
      sync: boolean,
      wallet?: ChainWalletBase | (typeof CosmosWalletRegistry)[number]
    ) => void;
    onCreate1CTSession: () => void;
    show1CTConnectAWallet: boolean;
    setShow1CTConnectAWallet: Dispatch<SetStateAction<boolean>>;
    show1CTEditParams: boolean;
    setShow1CTEditParams: Dispatch<SetStateAction<boolean>>;
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
    const hasInstalledWallets = useHasInstalledWallets();
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
            <Button onClick={() => onConnect(false, currentWallet)}>
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
            <Button onClick={() => onConnect(false, currentWallet)}>
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
