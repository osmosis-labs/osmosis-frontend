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
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, {
  ComponentPropsWithoutRef,
  Fragment,
  FunctionComponent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import ClientOnly from "~/components/client-only";
import SkeletonLoader from "~/components/skeleton-loader";
import {
  Step,
  Stepper,
  StepperLeftChevronNavigation,
  StepperRightChevronNavigation,
  StepsIndicator,
} from "~/components/stepper";
import { AvailableWallets, WalletRegistry } from "~/config";
import { useWindowSize } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";

const QRCode = React.lazy(() => import("~/components/qrcode"));

type ModalView =
  | "list"
  | "qrCode"
  | "connecting"
  | "connected"
  | "error"
  | "doesNotExist"
  | "rejected";

function getModalView(qrState: State, walletStatus?: WalletStatus): ModalView {
  switch (walletStatus) {
    case WalletStatus.Connecting:
      if (qrState === State.Init) {
        return "connecting";
      } else {
        return "qrCode";
      }
    case WalletStatus.Connected:
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

const OnboardingSteps = (t: ReturnType<typeof useTranslation>) => [
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

export const WalletSelectModal: FunctionComponent<
  ModalBaseProps & { walletRepo: WalletRepo; onConnect?: () => void }
> = observer((props) => {
  const {
    isOpen,
    onRequestClose,
    walletRepo: walletRepoProp,
    onConnect: onConnectProp,
  } = props;
  const { accountStore, chainStore } = useStore();

  // const t = useTranslation();
  const [qrState, setQRState] = useState<State>(State.Init);
  const [qrMessage, setQRMessage] = useState<string>("");
  const [modalView, setModalView] = useState<ModalView>("list");
  const [lazyWalletInfo, setLazyWalletInfo] =
    useState<(typeof WalletRegistry)[number]>();

  const current = walletRepoProp?.current;
  const walletStatus = current?.walletStatus;
  const chainName = walletRepoProp?.chainRecord.chain.chain_name;

  useEffect(() => {
    if (isOpen) {
      setModalView(getModalView(qrState, walletStatus));
    }
  }, [qrState, walletStatus, isOpen, qrMessage]);

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
      .then(() => {
        onConnectProp?.();
      })
      .catch(handleConnectError);
  };

  const onRequestBack =
    modalView !== "list"
      ? () => {
          if (
            walletStatus === WalletStatus.Connecting ||
            walletStatus === WalletStatus.Rejected ||
            walletStatus === WalletStatus.Error
          ) {
            walletRepoProp?.disconnect();
            walletRepoProp?.activate();
          }
          setModalView("list");
        }
      : undefined;

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      hideCloseButton
      className="max-h-screen w-full max-w-[800px] overflow-hidden !px-0 py-0"
    >
      <div className="flex min-h-[50vh] overflow-auto sm:flex-col">
        <ClientOnly
          className={classNames(
            "h-full w-full max-w-[284px] sm:max-w-none sm:bg-[rgba(20,15,52,0.2)]",
            "before:pointer-events-none before:absolute before:inset-0 before:max-w-[284px] before:bg-[rgba(20,15,52,0.2)] before:sm:hidden"
          )}
        >
          <LeftModalContent onConnect={onConnect} walletRepo={walletRepoProp} />
        </ClientOnly>

        <div className="relative w-full py-8 sm:static">
          {onRequestBack && (
            <IconButton
              aria-label="Go Back"
              icon={<Icon id="chevron-left" width={16} height={16} />}
              mode="unstyled"
              className="absolute left-0 top-[2.2rem] z-50 ml-5 h-auto w-fit py-0 text-osmoverse-400 hover:text-white-full"
              onClick={onRequestBack}
            />
          )}
          <RightModalContent
            {...props}
            onRequestClose={onClose}
            modalView={modalView}
            onConnect={onConnect}
            lazyWalletInfo={lazyWalletInfo}
          />
          <IconButton
            aria-label="Close"
            icon={<Icon id="close" width={30} height={30} />}
            mode="unstyled"
            className="absolute right-0 top-[1.9rem] z-50 mr-5 h-auto w-fit py-0 text-osmoverse-400 hover:text-white-full"
            onClick={onClose}
          />
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
  }
> = observer(({ walletRepo, onConnect }) => {
  const { isMobile } = useWindowSize();
  const t = useTranslation();

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
    <section className="flex flex-col gap-8 overflow-auto py-8 pl-8 pr-5">
      <h1 className="z-10 font-h6 text-h6 tracking-wider sm:text-center">
        {t("connectWallet")}
      </h1>
      <div className="z-10 flex flex-col gap-8">
        {Object.entries(categories)
          .filter(([_, wallets]) => wallets.length > 0)
          .map(([categoryName, wallets]) => {
            return (
              <div key={categoryName} className="flex flex-col">
                <h2 className="subtitle1 text-osmoverse-100 sm:hidden">
                  {t(categoryName)}
                </h2>

                <div className="flex flex-col">
                  {wallets.map((wallet) => (
                    <button
                      className={classNames(
                        "button flex w-full items-center gap-3 rounded-xl px-3 font-bold text-osmoverse-100 transition-colors hover:bg-osmoverse-700",
                        "col-span-2 py-3 font-normal",
                        "sm:w-fit sm:flex-col",
                        walletRepo?.current?.walletName === wallet.name &&
                          "bg-osmoverse-700"
                      )}
                      key={wallet.name}
                      onClick={() => onConnect(false, wallet)}
                    >
                      <Image
                        src={wallet.logo ?? "/"}
                        width={40}
                        height={40}
                        alt={`${wallet.prettyName} logo`}
                      />
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

const RightModalContent: FunctionComponent<
  Pick<
    ComponentPropsWithoutRef<typeof WalletSelectModal>,
    "walletRepo" | "onRequestClose"
  > & {
    modalView: ModalView;
    lazyWalletInfo?: (typeof WalletRegistry)[number];
    onConnect: (
      sync: boolean,
      wallet?: ChainWalletBase | (typeof WalletRegistry)[number]
    ) => void;
  }
> = observer(
  ({ walletRepo, onRequestClose, modalView, onConnect, lazyWalletInfo }) => {
    const t = useTranslation();
    const { accountStore } = useStore();

    const currentWallet = walletRepo?.current;
    const walletInfo = currentWallet?.walletInfo ?? lazyWalletInfo;

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
            <Image
              width={64}
              height={64}
              src={walletInfo?.logo ?? "/"}
              alt="Wallet logo"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-center font-h6 text-h6">
              {t("walletSelect.somethingWentWrong")}
            </h1>
            <p className="body2 text-center text-wosmongton-100">{message}</p>
          </div>
          <Button onClick={() => onConnect(false, currentWallet)}>
            {t("walletSelect.reconnect")}
          </Button>
        </div>
      );
    }

    if (modalView === "doesNotExist") {
      const downloadInfo = currentWallet?.downloadInfo;
      return (
        <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-12 pt-6">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
            <Image
              width={64}
              height={64}
              src={walletInfo?.logo ?? "/"}
              alt="Wallet logo"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-center font-h6 text-h6">
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
            <Image
              width={64}
              height={64}
              src={walletInfo?.logo ?? "/"}
              alt="Wallet logo"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-center font-h6 text-h6">
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
            <Image
              width={64}
              height={64}
              src={walletInfo?.logo ?? "/"}
              alt="Wallet logo"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-center font-h6 text-h6">{title}</h1>
            <p className="body2 text-center text-wosmongton-100">{desc}</p>
          </div>
        </div>
      );
    }

    if (modalView === "qrCode") {
      return <QRCodeView wallet={currentWallet!} />;
    }

    return (
      <div className="flex flex-col px-8">
        <h1 className="mb-10 w-full text-center font-h6 text-h6 tracking-wider">
          {t("Getting Started")}
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
        </Stepper>
      </div>
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
  const t = useTranslation();

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
          <h1 className="mb-6 w-full text-center font-h6 text-h6 tracking-wider">
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
                <h1 className="text-center font-h6 text-h6">{errorTitle}</h1>
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
                        logoUrl={wallet?.walletInfo.logo}
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
                              logoUrl={wallet?.walletInfo.logo}
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
