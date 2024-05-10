import {
  ChainWalletBase,
  ExpiredError,
  State,
  WalletRepo,
  WalletStatus,
} from "@cosmos-kit/core";
import { Popover } from "@headlessui/react";
import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
  WalletConnectionInProgressError,
} from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, {
  ComponentPropsWithoutRef,
  Dispatch,
  Fragment,
  FunctionComponent,
  SetStateAction,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocalStorage, useUpdateEffect } from "react-use";

import { Icon } from "~/components/assets";
import ClientOnly from "~/components/client-only";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { IntroducingOneClick } from "~/components/one-click-trading/introducing-one-click-trading";
import { OneClickFloatingBannerDoNotShowKey } from "~/components/one-click-trading/one-click-floating-banner";
import OneClickTradingConnectToContinue from "~/components/one-click-trading/one-click-trading-connect-to-continue";
import OneClickTradingSettings from "~/components/one-click-trading/one-click-trading-settings";
import OneClickTradingWelcomeBack from "~/components/one-click-trading/one-click-trading-welcome-back";
import { Screen, ScreenManager } from "~/components/screen-manager";
import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";
import { Button } from "~/components/ui/button";
import { AvailableWallets, WalletRegistry } from "~/config";
import { MultiLanguageT, useFeatureFlags, useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import {
  CreateOneClickSessionError,
  useCreateOneClickTradingSession,
} from "~/hooks/mutations/one-click-trading";
import { useOneClickTradingParams } from "~/hooks/one-click-trading/use-one-click-trading-params";
import { ModalBase, ModalBaseProps, ModalCloseButton } from "~/modals/base";
import { useStore } from "~/stores";

const QRCode = React.lazy(() => import("~/components/qrcode"));

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

function getModalView({
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
  switch (walletStatus) {
    case WalletStatus.Connecting:
      if (qrState === State.Init) {
        return "connecting";
      } else {
        return "qrCode";
      }
    case WalletStatus.Connected:
      if (hasOneClickTradingError) return "initializeOneClickTradingError";
      if (isInitializingOneClickTrading)
        return hasBroadcastedTx
          ? "broadcastedOneClickTrading"
          : "initializingOneClickTrading";
      return "connected";
    case WalletStatus.Error:
      if (qrState === State.Init) {
        return "error";
      } else {
        return "qrCode";
      }
    case WalletStatus.Rejected:
      return "rejected";
    case WalletStatus.NotExist:
      return "doesNotExist";
    case WalletStatus.Disconnected:
    default:
      return "list";
  }
}

const OnboardingSteps = (t: MultiLanguageT) => [
  {
    title: t("walletSelect.step1Title"),
    content: t("walletSelect.step1Content"),
  },
  {
    title: t("walletSelect.step2Title"),
    content: t("walletSelect.step2Content"),
  },
  {
    title: t("walletSelect.step3Title"),
    content: t("walletSelect.step3Content"),
  },
  {
    title: t("walletSelect.step4Title"),
    content: t("walletSelect.step4Content"),
  },
];

const useHasInstalledWallets = () => {
  return useMemo(() => {
    const wallets = WalletRegistry.filter(
      (wallet) =>
        wallet.windowPropertyName && wallet.windowPropertyName in window
    );

    return wallets.length > 0;
  }, []);
};

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
    useState<(typeof WalletRegistry)[number]>();
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
    wallet?: ChainWalletBase | (typeof WalletRegistry)[number]
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
          <LeftModalContent
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
          <RightModalContent
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

const LeftModalContent: FunctionComponent<
  Pick<ComponentPropsWithoutRef<typeof WalletSelectModal>, "walletRepo"> & {
    onConnect: (
      sync: boolean,
      wallet?: ChainWalletBase | (typeof WalletRegistry)[number]
    ) => void;
    isMobile: boolean;
    modalView: ModalView;
  }
> = observer(({ walletRepo, onConnect, isMobile, modalView }) => {
  const { t } = useTranslation();

  const wallets = useMemo(
    () =>
      [...WalletRegistry]
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
        }, [] as (typeof WalletRegistry)[number][]),
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
      wallets.reduce(
        (acc, wallet) => {
          if (wallet.mode === "wallet-connect") {
            acc["walletSelect.mobileWallets"].push(wallet);
            return acc;
          }

          if (
            wallet.windowPropertyName &&
            wallet.windowPropertyName in window
          ) {
            acc["walletSelect.installedWallets"].push(wallet);
            return acc;
          }

          acc["walletSelect.otherWallets"].push(wallet);
          return acc;
        },
        {
          "walletSelect.installedWallets":
            [] as (typeof WalletRegistry)[number][],
          "walletSelect.mobileWallets": [] as (typeof WalletRegistry)[number][],
          "walletSelect.otherWallets": [] as (typeof WalletRegistry)[number][],
        }
      ),
    [wallets]
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

const RightModalContent: FunctionComponent<
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
    lazyWalletInfo?: (typeof WalletRegistry)[number];
    onConnect: (
      sync: boolean,
      wallet?: ChainWalletBase | (typeof WalletRegistry)[number]
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
        <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-12 pt-6">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
            {!!walletInfo && typeof walletInfo?.logo === "string" && (
              <img
                width={64}
                height={64}
                src={walletInfo.logo}
                alt="Wallet logo"
              />
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-center text-h6 font-h6">
                {t("walletSelect.somethingWentWrong")}
              </h1>
              <p className="body2 text-center text-wosmongton-100">{message}</p>
            </div>
            <Button onClick={() => onConnect(false, currentWallet)}>
              {t("walletSelect.reconnect")}
            </Button>
          </div>
        </div>
      );
    }

    if (modalView === "doesNotExist") {
      const downloadInfo = currentWallet?.downloadInfo;
      return (
        <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-12 pt-6">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
            <img
              width={64}
              height={64}
              src={
                typeof walletInfo?.logo === "string"
                  ? walletInfo?.logo ?? "/"
                  : "/"
              }
              alt="Wallet logo"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-center text-h6 font-h6">
              {t("walletSelect.isNotInstalled", {
                walletName: walletInfo?.prettyName ?? "",
              })}
            </h1>
            <p className="body2 text-center text-wosmongton-100">
              {Boolean(downloadInfo)
                ? t("walletSelect.maybeInstalled", {
                    walletName: walletInfo?.prettyName?.toLowerCase() ?? "",
                  })
                : t("walletSelect.downloadLinkNotProvided")}
            </p>
          </div>
          {Boolean(downloadInfo) && (
            <Button
              onClick={() => {
                window.open(currentWallet?.downloadInfo?.link, "_blank");
              }}
            >
              {t("walletSelect.installWallet", {
                walletName: walletInfo?.prettyName ?? "",
              })}
            </Button>
          )}
        </div>
      );
    }

    if (modalView === "rejected") {
      return (
        <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-12 pt-6">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
            {!!walletInfo && typeof walletInfo?.logo === "string" && (
              <img
                width={64}
                height={64}
                src={walletInfo.logo}
                alt="Wallet logo"
              />
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-center text-h6 font-h6">
                {t("walletSelect.requestRejected")}
              </h1>
              <p className="body2 text-center text-wosmongton-100">
                {currentWallet?.rejectMessageTarget ??
                  t("walletSelect.connectionDenied")}
              </p>
            </div>
            <Button onClick={() => onConnect(false, currentWallet)}>
              {t("walletSelect.reconnect")}
            </Button>
          </div>
        </div>
      );
    }

    if (modalView === "initializeOneClickTradingError") {
      const title = t("walletSelect.errorInitializingOneClickTradingSession");
      const desc = t("walletSelect.retryInWalletOrContinue", {
        walletName: walletInfo?.prettyName ?? "",
      });

      return (
        <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-12 pt-6">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
            {!!walletInfo && typeof walletInfo?.logo === "string" && (
              <img
                width={64}
                height={64}
                src={walletInfo.logo}
                alt="Wallet logo"
              />
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-center text-h6 font-h6">{title}</h1>
              <p className="body2 text-center text-wosmongton-100">{desc}</p>
            </div>

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
          </div>
        </div>
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
        <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-12 pt-3">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:animate-spin-slow after:rounded-full after:border-2 after:border-b-transparent after:border-l-wosmongton-300 after:border-r-wosmongton-300 after:border-t-transparent">
            {!!walletInfo && typeof walletInfo?.logo === "string" && (
              <img
                width={64}
                height={64}
                src={walletInfo.logo}
                alt="Wallet logo"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-center text-h6 font-h6">{title}</h1>
          </div>
        </div>
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
        <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-12 pt-3">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:animate-spin-slow after:rounded-full after:border-2 after:border-b-transparent after:border-l-wosmongton-300 after:border-r-wosmongton-300 after:border-t-transparent">
            {!!walletInfo && typeof walletInfo?.logo === "string" && (
              <img
                width={64}
                height={64}
                src={walletInfo.logo}
                alt="Wallet logo"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-center text-h6 font-h6">{title}</h1>
            <p className="body2 text-center text-wosmongton-100">{desc}</p>
          </div>
        </div>
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
          <div className="flex flex-col px-8 pt-1.5">
            <h1 className="mb-10 w-full text-center text-h6 font-h6 tracking-wider">
              {t("walletSelect.gettingStarted")}
            </h1>
            <Stepper
              className="relative flex flex-col gap-2"
              autoplay={{ stopOnHover: true, delayInMs: 4000 }}
            >
              <StepsIndicator className="order-1 mt-16" />
              <StepperLeftChevronNavigation className="absolute left-0 top-1/2 z-50 -translate-y-1/2 transform" />
              {OnboardingSteps(t).map(({ title, content }) => (
                <Step key={title}>
                  <div className="flex flex-col items-center justify-center gap-10 text-center">
                    <div className="h-[186px] w-[186px]">
                      <Image
                        src="/images/wallet-showcase.svg"
                        alt="Wallet showcase"
                        width={186}
                        height={186}
                      />
                    </div>
                    <div className="flex max-w-sm flex-col gap-3">
                      <h1 className="subtitle1">{title}</h1>
                      <p className="body2 text-osmoverse-200">{content}</p>
                    </div>
                  </div>
                </Step>
              ))}
              <StepperRightChevronNavigation className="absolute right-0 top-1/2 z-50 -translate-y-1/2 transform" />
              <StepsIndicator className="mt-16" />
            </Stepper>
          </div>
        )}
      </>
    );
  }
);

const QRCodeLoader = () => (
  <div className="mb-7">
    <SkeletonLoader>
      <div className="flex items-center justify-center rounded-xl p-3.5">
        <div className="h-[280px] w-[280px]" />
      </div>
    </SkeletonLoader>
  </div>
);

type QRCodeStatus = "pending" | "done" | "error" | "expired" | undefined;
const QRCodeView: FunctionComponent<{ wallet?: ChainWalletBase }> = ({
  wallet,
}) => {
  const { t } = useTranslation();

  const qrUrl = wallet?.qrUrl;

  const [errorTitle, errorDesc, status] = useMemo(() => {
    const isExpired = qrUrl?.message === ExpiredError.message;

    const errorDesc = isExpired
      ? t("walletSelect.clickToRefresh")
      : qrUrl?.message;
    const errorTitle = isExpired
      ? t("walletSelect.qrCodeExpired")
      : t("walletSelect.qrCodeError");

    const statusDict: Record<State, QRCodeStatus> = {
      [State.Pending]: "pending" as const,
      [State.Done]: "done" as const,
      [State.Error]: isExpired ? ("expired" as const) : ("error" as const),
      [State.Init]: undefined,
    };

    return [errorTitle, errorDesc, statusDict[qrUrl?.state ?? State.Init]];
  }, [qrUrl?.message, qrUrl?.state, t]);

  const downloadLink = wallet?.walletInfo.downloads?.find(
    ({ os }) => !os
  )?.link;

  return (
    <Popover as={Fragment}>
      {({ open: isDownloadQROpen }) => (
        <div
          className={classNames(
            "relative flex flex-col items-center justify-center gap-4",
            isDownloadQROpen &&
              "before:absolute before:inset-0 before:z-50 before:bg-osmoverse-800/70"
          )}
        >
          <h1 className="mb-6 w-full text-center text-h6 font-h6 tracking-wider">
            {t("walletSelect.connectWith")} {wallet?.walletPrettyName}
          </h1>

          <div className="mb-6 flex flex-col items-center justify-center gap-3">
            <p className="flex items-center gap-2 rounded-2xl bg-osmoverse-900 px-10 py-3 text-osmoverse-200">
              <span>{t("walletSelect.tapThe")}</span>
              <Image
                src="/icons/scan.png"
                alt="scan icon"
                width={28}
                height={28}
              />
              <span>{t("walletSelect.button")}</span>
            </p>

            <p className="body2 max-w-sm text-center text-wosmongton-100">
              {t("walletSelect.topRightButton", {
                wallet: wallet?.walletPrettyName ?? "",
              })}
            </p>
          </div>

          {(status === "error" || status === "expired") && (
            <>
              <div className="relative mb-7 flex items-center justify-center rounded-xl bg-white-high p-3.5">
                <div className="absolute inset-0 rounded-xl bg-white-high/80" />
                <QRCode value="https//" size={280} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    className="w-fit"
                    onClick={() => wallet?.connect(false)}
                  >
                    {t("walletSelect.refresh")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-center text-h6 font-h6">{errorTitle}</h1>
                <p className="body2 text-center text-wosmongton-100">
                  {errorDesc}
                </p>
              </div>
            </>
          )}
          {status === "pending" && <QRCodeLoader />}
          {status === "done" && (
            <div className="flex flex-col items-center gap-1">
              <div className="w-fit">
                {Boolean(qrUrl?.data) && (
                  <Suspense fallback={<QRCodeLoader />}>
                    <div
                      className={classNames(
                        "mb-2 flex items-center justify-center rounded-3xl bg-white-high p-3.5"
                      )}
                    >
                      <QRCode
                        logoSize={70}
                        logoUrl={
                          typeof wallet?.walletInfo.logo === "string"
                            ? wallet?.walletInfo.logo
                            : undefined
                        }
                        value={qrUrl?.data!}
                        size={280}
                      />
                    </div>
                  </Suspense>
                )}
              </div>

              <div className="flex items-center gap-2">
                <p className="body2 text-osmoverse-200">
                  {t("walletSelect.dontHaveThisWallet")}
                </p>

                <div className="relative">
                  <Popover.Button
                    className={classNames(
                      "button relative z-[60] flex h-6 w-auto items-center rounded-xl bg-wosmongton-500 px-2 hover:bg-wosmongton-300",
                      isDownloadQROpen && "bg-wosmongton-300"
                    )}
                  >
                    {t("walletSelect.get")} {wallet?.walletPrettyName}
                  </Popover.Button>

                  <Popover.Panel className="subtitle1 absolute bottom-8 right-0 z-[60] flex flex-col gap-3 rounded-3xl bg-osmoverse-800 px-10 py-6 text-center shadow-[0px_6px_8px_0px_#09052433]">
                    <p className="text-osmoverse-100">
                      {t("walletSelect.scanThis")} {wallet?.walletPrettyName}
                    </p>
                    {typeof downloadLink === "string" &&
                      downloadLink !== "" && (
                        <Suspense fallback={<QRCodeLoader />}>
                          <div
                            className={classNames(
                              "mb-2 flex items-center justify-center rounded-3xl bg-white-high p-3.5"
                            )}
                          >
                            <QRCode
                              logoSize={70}
                              logoUrl={
                                typeof wallet?.walletInfo.logo === "string"
                                  ? wallet?.walletInfo.logo
                                  : undefined
                              }
                              value={downloadLink}
                              size={280}
                            />
                          </div>
                        </Suspense>
                      )}
                  </Popover.Panel>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Popover>
  );
};
