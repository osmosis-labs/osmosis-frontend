import {
  ChainWalletBase,
  ExpiredError,
  State,
  WalletRepo,
  WalletStatus,
} from "@cosmos-kit/core";
import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
} from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
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
import SkeletonLoader from "~/components/skeleton-loader";
import { AvailableWallets, WalletRegistry } from "~/config";
import { useWindowSize } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";

const QRCode = dynamic(() => import("qrcode.react"));

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
  const t = useTranslation();
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
      onRequestBack={
        modalView !== "list"
          ? () => {
              if (
                walletStatus === WalletStatus.Connecting ||
                walletStatus === WalletStatus.Rejected ||
                walletStatus === WalletStatus.Error
              ) {
                walletRepo?.disconnect();
                walletRepo?.activate();
              }
              setModalView("list");
            }
          : undefined
      }
      className="max-h-screen max-w-[30.625rem] overflow-auto"
      title={t("connectWallet")}
    >
      <div className="pt-8">
        <ModalContent
          {...props}
          onRequestClose={onClose}
          modalView={modalView}
          setModalView={setModalView}
        />
      </div>
    </ModalBase>
  );
};

const ModalContent: FunctionComponent<
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
    const { isMobile } = useWindowSize();

    const [lazyWalletInfo, setLazyWalletInfo] =
      useState<(typeof WalletRegistry)[number]>();

    const currentWallet = walletRepo?.current;
    const walletInfo = currentWallet?.walletInfo ?? lazyWalletInfo;
    const chainName = walletRepo?.chainRecord.chain.chain_name;

    const onConnect = async (
      sync: boolean,
      wallet?: ChainWalletBase | (typeof WalletRegistry)[number]
    ) => {
      if (!wallet) return;

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

        const walletManager = await accountStore.addWallet(
          new WalletClass(walletInfo)
        );
        await walletManager.onMounted();
        setLazyWalletInfo(undefined);

        return walletManager
          .getWalletRepo(chainName)
          .connect(wallet.name, sync)
          .then(() => {
            onConnectProp?.();
          })
          .catch(handleConnectError);
      } else {
        installedWallet
          ?.connect(sync)
          .then(() => {
            onConnectProp?.();
          })
          .catch(handleConnectError);
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

    const wallets = [...WalletRegistry]
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
      }, [] as (typeof WalletRegistry)[number][])
      // Wallet connect should be last
      .sort((a, b) => {
        if (a.mode === b.mode) {
          return 0;
        } else if (a.mode !== "wallet-connect") {
          return -1;
        } else {
          // Move wallet-connect to the end
          return 1;
        }
      });

    return (
      <div className="flex flex-col gap-2">
        <div className="flex max-h-[50vh] flex-col gap-3 overflow-auto">
          {wallets?.map((wallet) => {
            return (
              <button
                className={classNames(
                  "flex items-center gap-3 rounded-xl bg-osmoverse-900 px-3 text-h6 font-h6 transition-colors hover:bg-osmoverse-700",
                  "py-3 font-normal"
                )}
                key={wallet.name}
                onClick={() => onConnect(false, wallet)}
              >
                <img className="h-16 w-16" src={wallet.logo} alt="" />
                <div className="flex flex-col gap-1 text-left">
                  <span>{wallet.prettyName}</span>
                  <span className="text-body2 font-body2 text-osmoverse-500">
                    {wallet.mode === "wallet-connect"
                      ? "Mobile wallet"
                      : "Browser extension"}
                  </span>
                </div>
                {wallet.mode === "wallet-connect" && (
                  <div className="flex-1" title="WalletConnect">
                    <Icon id="walletconnect" className="ml-auto" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-5 rounded-2xl bg-osmoverse-700 p-5">
          <p className="caption text-white-mid">
            {t("connectDisclaimer")}{" "}
            <Link href="/disclaimer" passHref>
              <a
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("protocolDisclaimer")}
              </a>
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }
);

type QRCodeStatus = "pending" | "done" | "error" | "expired" | undefined;
const QRCodeView: FunctionComponent<{ wallet?: ChainWalletBase }> = ({
  wallet,
}) => {
  const t = useTranslation();

  const walletInfo = wallet?.walletInfo;
  const qrUrl = wallet?.qrUrl;

  const [description, errorTitle, errorDesc, status] = useMemo(() => {
    const isExpired = qrUrl?.message === ExpiredError.message;

    const errorDesc = isExpired
      ? t("walletSelect.clickToRefresh")
      : qrUrl?.message;
    const errorTitle = isExpired
      ? t("walletSelect.qrCodeExpired")
      : t("walletSelect.qrCodeError");
    const description =
      qrUrl?.state === "Error"
        ? undefined
        : t("walletSelect.openAppToScan", {
            walletName: walletInfo?.prettyName ?? "",
          });

    const statusDict: Record<State, QRCodeStatus> = {
      [State.Pending]: "pending" as const,
      [State.Done]: "done" as const,
      [State.Error]: isExpired ? ("expired" as const) : ("error" as const),
      [State.Init]: undefined,
    };

    return [
      description,
      errorTitle,
      errorDesc,
      statusDict[qrUrl?.state ?? State.Init],
    ];
  }, [qrUrl?.message, qrUrl?.state, t, walletInfo?.prettyName]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-6">
      {(status === "error" || status === "expired") && (
        <>
          <div className="relative mb-7 flex items-center justify-center rounded-xl bg-white-high p-3.5">
            <div className="absolute inset-0 rounded-xl bg-white-high/80" />
            <QRCode value="https//" size={260} />
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
        <>
          {Boolean(qrUrl?.data) && (
            <div className="mb-7 flex items-center justify-center rounded-xl bg-white-high p-3.5">
              <QRCode value={qrUrl?.data!} size={260} />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h1 className="text-center text-h6 font-h6">Scan QR Code</h1>
            <p className="body2 text-center text-wosmongton-100">
              {description}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
