import {
  ChainWalletBase,
  ExpiredError,
  State,
  WalletRepo,
  WalletStatus,
} from "@cosmos-kit/core";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  ComponentPropsWithoutRef,
  FunctionComponent,
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
import { Step, Stepper, StepsIndicator } from "~/components/stepper";
import { WalletRegistry } from "~/config";
import { useWindowSize } from "~/hooks";
import { useStore } from "~/stores";

import { ModalBase, ModalBaseProps } from "./base";

const QRCode = dynamic(() => import("~/components/qrcode"));

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

export const WalletSelectModal: FunctionComponent<
  ModalBaseProps & { walletRepo: WalletRepo; onConnect?: () => void }
> = (props) => {
  const { isOpen, onRequestClose, walletRepo } = props;
  // const t = useTranslation();
  const [qrState, setQRState] = useState<State>(State.Init);
  const [qrMessage, setQRMessage] = useState<string>("");
  const [modalView, setModalView] = useState<ModalView>("list");

  const current = walletRepo?.current;
  const walletStatus = current?.walletStatus;

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
      walletRepo?.disconnect();
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      hideCloseButton
      // onRequestBack={
      //   modalView !== "list"
      //     ? () => {
      //         if (
      //           walletStatus === WalletStatus.Connecting ||
      //           walletStatus === WalletStatus.Rejected ||
      //           walletStatus === WalletStatus.Error
      //         ) {
      //           walletRepo?.disconnect();
      //           walletRepo?.activate();
      //         }
      //         setModalView("list");
      //       }
      //     : undefined
      // }
      className="max-h-screen w-full max-w-[896px] overflow-auto px-0 py-0"
    >
      <div className="flex min-h-[50vh]">
        <div className="w-full max-w-[284px] bg-[rgba(20,15,52,0.2)] py-8 pl-8 pr-5">
          <ClientOnly>
            <LeftModalContent
              {...props}
              onRequestClose={onClose}
              modalView={modalView}
              setModalView={setModalView}
            />
          </ClientOnly>
        </div>
        <div className="w-full py-8">
          <RightModalContent
            {...props}
            onRequestClose={onClose}
            modalView={modalView}
            setModalView={setModalView}
          />
        </div>
      </div>
    </ModalBase>
  );
};

const LeftModalContent: FunctionComponent<
  Pick<
    ComponentPropsWithoutRef<typeof WalletSelectModal>,
    "walletRepo" | "onRequestClose" | "onConnect"
  > & { modalView: ModalView; setModalView: (view: ModalView) => void }
> = observer(({ walletRepo, onConnect: onConnectProp, setModalView }) => {
  const { accountStore } = useStore();
  const { isMobile } = useWindowSize();
  const t = useTranslation();

  const [_lazyWalletInfo, setLazyWalletInfo] =
    useState<(typeof WalletRegistry)[number]>();

  const onConnect = async (
    sync: boolean,
    wallet?: ChainWalletBase | (typeof WalletRegistry)[number]
  ) => {
    if (!wallet) return;
    if (!("lazyInstall" in wallet)) {
      wallet
        .connect(sync)
        .then(() => {
          onConnectProp?.();
        })
        .catch((e) =>
          console.error("Error while connecting to direct wallet. Details: ", e)
        );
      return;
    }

    const installedWallet = walletRepo?.wallets.find(
      ({ walletName }) => walletName === wallet.name
    );

    // if wallet is not installed, install it
    if (!installedWallet && "lazyInstall" in wallet) {
      setLazyWalletInfo(wallet);
      setModalView("connecting");

      // wallet is now walletInfo
      const walletInfo = wallet;
      const WalletClass = await wallet.lazyInstall();

      const walletManager = accountStore.addWallet(new WalletClass(walletInfo));
      walletManager.onMounted();

      return walletManager
        .getMainWallet(wallet.name)
        .connect(sync)
        .then(() => {
          setLazyWalletInfo(undefined);
          onConnectProp?.();
        })
        .catch((e) =>
          console.error(
            "Error while connecting to newly installed wallet. Details: ",
            e
          )
        );
    } else {
      installedWallet
        ?.connect(sync)
        .then(() => {
          onConnectProp?.();
        })
        .catch((e) =>
          console.error(
            "Error while connecting to installed wallet. Details: ",
            e
          )
        );
    }
  };

  const wallets = [...WalletRegistry]
    // If mobile, filter out browser wallets
    .filter((w) => (isMobile ? !w.mobileDisabled : true));

  const categories = wallets.reduce(
    (acc, wallet) => {
      if (wallet.mode === "wallet-connect") {
        acc["Mobile Wallets"].push(wallet);
        return acc;
      }

      if (wallet.windowPropertyName && wallet.windowPropertyName in window) {
        acc["Installed Wallets"].push(wallet);
        return acc;
      }

      acc["Other Wallets"].push(wallet);
      return acc;
    },
    {
      "Installed Wallets": [] as (typeof WalletRegistry)[number][],
      "Mobile Wallets": [] as (typeof WalletRegistry)[number][],
      "Other Wallets": [] as (typeof WalletRegistry)[number][],
    }
  );

  return (
    <section className="flex max-h-[50vh] flex-col gap-8 overflow-auto">
      <h1 className="text-h6 font-h6 tracking-wider">{t("connectWallet")}</h1>
      <div className="flex  flex-col gap-8">
        {Object.entries(categories)
          .filter(([_, wallets]) => wallets.length > 0)
          .map(([categoryName, wallets]) => {
            return (
              <div key={categoryName} className="flex flex-col">
                <h2 className="subtitle1 text-osmoverse-300">{categoryName}</h2>

                <div className="flex flex-col">
                  {wallets.map((wallet) => (
                    <button
                      className={classNames(
                        "button flex w-full items-center gap-3 rounded-xl px-3 font-bold text-osmoverse-100 transition-colors hover:bg-osmoverse-700",
                        "col-span-2 py-3 font-normal",
                        walletRepo?.current?.walletName === wallet.name &&
                          "bg-osmoverse-700"
                      )}
                      key={wallet.name}
                      onClick={() => onConnect(true, wallet)}
                    >
                      <Image
                        src={wallet.logo ?? "/"}
                        width={40}
                        height={40}
                        alt=""
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
    "walletRepo" | "onRequestClose" | "onConnect"
  > & { modalView: ModalView; setModalView: (view: ModalView) => void }
> = observer(
  ({
    walletRepo,
    onRequestClose,
    modalView,
    onConnect: onConnectProp,
    setModalView,
  }) => {
    const { accountStore } = useStore();
    const t = useTranslation();

    const [lazyWalletInfo, setLazyWalletInfo] =
      useState<(typeof WalletRegistry)[number]>();

    const currentWallet = walletRepo?.current;
    const walletInfo = currentWallet?.walletInfo ?? lazyWalletInfo;

    const onConnect = async (
      sync: boolean,
      wallet?: ChainWalletBase | (typeof WalletRegistry)[number]
    ) => {
      if (!wallet) return;
      if (!("lazyInstall" in wallet)) {
        wallet
          .connect(sync)
          .then(() => {
            onConnectProp?.();
          })
          .catch((e) =>
            console.error(
              "Error while connecting to direct wallet. Details: ",
              e
            )
          );
        return;
      }

      const installedWallet = walletRepo?.wallets.find(
        ({ walletName }) => walletName === wallet.name
      );

      // if wallet is not installed, install it
      if (!installedWallet && "lazyInstall" in wallet) {
        setLazyWalletInfo(wallet);
        setModalView("connecting");

        // wallet is now walletInfo
        const walletInfo = wallet;
        const WalletClass = await wallet.lazyInstall();

        const walletManager = accountStore.addWallet(
          new WalletClass(walletInfo)
        );
        walletManager.onMounted();

        return walletManager
          .getMainWallet(wallet.name)
          .connect(sync)
          .then(() => {
            setLazyWalletInfo(undefined);
            onConnectProp?.();
          })
          .catch((e) =>
            console.error(
              "Error while connecting to newly installed wallet. Details: ",
              e
            )
          );
      } else {
        installedWallet
          ?.connect(sync)
          .then(() => {
            onConnectProp?.();
          })
          .catch((e) =>
            console.error(
              "Error while connecting to installed wallet. Details: ",
              e
            )
          );
      }
    };

    if (modalView === "connected") {
      onRequestClose();
    }

    if (modalView === "error") {
      return (
        <div className="flex flex-col items-center justify-center gap-12 pt-6">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
            <Image
              width={64}
              height={64}
              src={walletInfo?.logo ?? "/"}
              alt="Wallet logo"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-center text-h6 font-h6">
              {t("walletSelect.somethingWentWrong")}
            </h1>
            <p className="body2 text-center text-wosmongton-100">
              {currentWallet?.message}
            </p>
          </div>
          <Button onClick={() => walletRepo?.disconnect()}>
            {t("walletSelect.changeWallet")}
          </Button>
        </div>
      );
    }

    if (modalView === "doesNotExist") {
      const downloadInfo = currentWallet?.downloadInfo;
      return (
        <div className="flex flex-col items-center justify-center gap-12 pt-6">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
            <Image
              width={64}
              height={64}
              src={walletInfo?.logo ?? "/"}
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
        <div className="flex flex-col items-center justify-center gap-12 pt-6">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
            <Image
              width={64}
              height={64}
              src={walletInfo?.logo ?? "/"}
              alt="Wallet logo"
            />
          </div>

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
        <div className="flex flex-col items-center justify-center gap-12 pt-3">
          <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:animate-spin-slow after:rounded-full after:border-2 after:border-t-transparent after:border-b-transparent after:border-l-wosmongton-300 after:border-r-wosmongton-300">
            <Image
              width={64}
              height={64}
              src={walletInfo?.logo ?? "/"}
              alt="Wallet logo"
            />
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

    return (
      <div className="flex flex-col px-8">
        <div className="relative mb-10 flex items-center">
          <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
            {t("Getting Started")}
          </h1>
          <IconButton
            aria-label="Close"
            icon={<Icon id="close" width={30} height={30} />}
            mode="unstyled"
            className="absolute right-0 h-auto w-fit py-0 text-osmoverse-400 hover:text-white-full"
            onClick={onRequestClose}
          />
        </div>

        <Stepper
          className="flex flex-col gap-2"
          autoplay={{ stopOnHover: true, delayInMs: 8000 }}
        >
          <StepsIndicator className="order-1 my-16" />
          <Step>
            <div className="flex flex-col items-center justify-center gap-10 text-center">
              <div className="h-[186px] w-[186px]">
                <Image
                  src="/images/wallet-showcase.png"
                  alt="Wallet showcase"
                  width={186}
                  height={186}
                />
              </div>

              <div className="flex max-w-sm flex-col gap-3">
                <h1 className="subtitle1">What are wallets?</h1>
                <p className="body2 text-osmoverse-300">
                  Wallets are used to send, receive, and store all your digital
                  assets like OSMO and ATOM.
                </p>
              </div>
            </div>
          </Step>
          <Step>
            <div className="flex flex-col items-center justify-center gap-10 text-center">
              <div className="h-[186px] w-[186px]">
                <Image
                  src="/images/wallet-showcase.png"
                  alt="Wallet showcase"
                  width={186}
                  height={186}
                />
              </div>

              <div className="flex max-w-sm flex-col gap-3">
                <h1 className="subtitle1">No accounts. No passwords.</h1>
                <p className="body2 text-osmoverse-300">
                  Use your wallet to sign into many different platforms. No
                  unique accounts or passwords.
                </p>
              </div>
            </div>
          </Step>
          <Step>
            <div className="flex flex-col items-center justify-center gap-10 text-center">
              <div className="h-[186px] w-[186px]">
                <Image
                  src="/images/wallet-showcase.png"
                  alt="Wallet showcase"
                  width={186}
                  height={186}
                />
              </div>

              <div className="flex max-w-sm flex-col gap-3">
                <h1 className="subtitle1">Your keys, your funds.</h1>
                <p className="body2 text-osmoverse-300">
                  The beauty of a decentralized exchange. None of your assets
                  are ever with us.
                </p>
              </div>
            </div>
          </Step>
          <Step>
            <div className="flex flex-col items-center justify-center gap-10 text-center">
              <div className="h-[186px] w-[186px]">
                <Image
                  src="/images/wallet-showcase.png"
                  alt="Wallet showcase"
                  width={186}
                  height={186}
                />
              </div>

              <div className="flex max-w-sm flex-col gap-3">
                <h1 className="subtitle1">Create a wallet to get started</h1>
                <p className="body2 text-osmoverse-300">
                  Set up your first wallet and get signed in! Send, receive, or
                  buy assets.
                </p>
              </div>
            </div>
          </Step>
        </Stepper>
      </div>
    );
  }
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

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="mb-6 w-full text-center text-h6 font-h6 tracking-wider">
        Connect with {wallet?.walletPrettyName}
      </h1>

      <div className="mb-7 flex flex-col items-center justify-center gap-3">
        <p className="flex items-center gap-2 rounded-2xl bg-osmoverse-900 px-10 py-3 text-osmoverse-200">
          <span>Tap the</span>
          <Image src="/icons/scan.png" alt="scan icon" width={28} height={28} />
          <span>button</span>
        </p>

        <p className="body2 max-w-sm text-center text-wosmongton-100">
          on the top right corner of your Keplr mobile app. Scan the QR code
          below to connect.
        </p>
      </div>

      {(status === "error" || status === "expired") && (
        <>
          <div className="relative mb-7 flex items-center justify-center rounded-xl bg-white-high p-3.5">
            <div className="absolute inset-0 rounded-xl bg-white-high/80" />
            <QRCode value="https//" size={280} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button className="w-fit" onClick={() => wallet?.connect(false)}>
                {t("walletSelect.refresh")}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-center text-h6 font-h6">{errorTitle}</h1>
            <p className="body2 text-center text-wosmongton-100">{errorDesc}</p>
          </div>
        </>
      )}
      {status === "pending" && (
        <div className="mb-7">
          <SkeletonLoader>
            <div className="flex items-center justify-center rounded-xl p-3.5">
              <div className="h-[260px] w-[260px]" />
            </div>
          </SkeletonLoader>
        </div>
      )}
      {status === "done" && (
        <div className="flex flex-col items-center">
          <div className="w-fit">
            {Boolean(qrUrl?.data) && (
              <div className="mb-2 flex items-center justify-center rounded-xl bg-white-high p-3.5">
                <QRCode
                  logoSize={70}
                  logoUrl={wallet?.walletInfo.logo}
                  value={qrUrl?.data!}
                  size={280}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <p className="body2 text-osmoverse-200">
              Don&apos;t have this wallet?
            </p>
            <a
              href={wallet?.walletInfo.downloads?.[0].link}
              className="button flex h-6 w-auto items-center rounded-xl bg-wosmongton-500 px-2"
            >
              Get {wallet?.walletPrettyName}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
