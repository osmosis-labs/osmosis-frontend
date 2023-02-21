import { State, WalletRepo, WalletStatus } from "@cosmos-kit/core";
import React, {
  ComponentPropsWithoutRef,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";

import { ModalBase, ModalBaseProps } from "./base";

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
    // switch (qrState) {
    //   case QRCodeState.Pending:
    //     return "loadingQRCode";
    //   case QRCodeState.Done:
    //     return "qrCode";
    //   case QRCodeState.Error:
    //     return qrMsg === ExpiredError.message
    //       ? "expiredQRCode"
    //       : "ErrorQRCode";
    //   default:
    //     return "connecting";
    // }
    case WalletStatus.Connected:
      return "connected";
    case WalletStatus.Error:
      if (qrState === State.Init) {
        return "error";
      } else {
        return "qrCode";
      }
    // switch (qrState) {
    //   case QRCodeState.Error:
    //     return qrMsg === ExpiredError.message
    //       ? "expiredQRCode"
    //       : "ErrorQRCode";
    //   default:
    //     return "error";
    // }
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
  ModalBaseProps & { walletRepo: WalletRepo }
> = (props) => {
  const { isOpen, onRequestClose, walletRepo } = props;
  const t = useTranslation();
  const [qrState, setQRState] = useState<State>(State.Init);
  const [qrMsg, setQRMsg] = useState<string | undefined>("");
  const [modalView, setModalView] = useState<ModalView>("list");

  const current = walletRepo?.current;
  const walletStatus = current?.walletStatus;

  useEffect(() => {
    if (isOpen) {
      setModalView(getModalView(qrState, walletStatus));
    }
  }, [qrState, walletStatus, isOpen]);

  current?.client?.setActions?.({
    qrUrl: {
      state: setQRState,
      message: setQRMsg,
    },
  });

  const onClose = () => {
    onRequestClose();
    if (walletStatus === WalletStatus.Connecting) {
      walletRepo?.disconnect();
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      onRequestBack={
        modalView !== "list" ? () => setModalView("list") : undefined
      }
      className="max-w-[30.625rem]"
      title={t("connectWallet")}
    >
      <div className="pt-8">
        <ModalContent
          {...props}
          onRequestClose={onClose}
          modalView={modalView}
        />
      </div>
    </ModalBase>
  );
};

const ModalContent: React.FC<
  Pick<
    ComponentPropsWithoutRef<typeof WalletSelectModal>,
    "walletRepo" | "onRequestClose"
  > & { modalView: ModalView }
> = ({ walletRepo, onRequestClose, modalView }) => {
  const current = walletRepo?.current;
  const walletInfo = current?.walletInfo;

  if (modalView === "connected") {
    onRequestClose();
  }

  if (modalView === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-12 pt-6">
        <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
          <img className="h-full w-full" src={walletInfo?.logo} alt="" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-center text-h6 font-h6">Something Went Wrong</h1>
          <p className="body2 text-center text-wosmongton-100">
            {current?.message}
          </p>
        </div>
        <Button onClick={() => walletRepo?.disconnect()}>Change Wallet</Button>
      </div>
    );
  }

  if (modalView === "doesNotExist") {
    const downloadInfo = current?.downloadInfo;
    return (
      <div className="flex flex-col items-center justify-center gap-12 pt-6">
        <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
          <img className="h-full w-full" src={walletInfo?.logo} alt="" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-center text-h6 font-h6">
            {walletInfo?.prettyName} is not Installed
          </h1>
          <p className="body2 text-center text-wosmongton-100">
            {Boolean(downloadInfo)
              ? `If ${walletInfo?.prettyName.toLowerCase()} is installed on your device, please refresh this page or follow the browser instructions.`
              : "Download link not provided. Try searching it or consulting the developer team."}
          </p>
        </div>
        {Boolean(downloadInfo) && (
          <Button
            onClick={() => {
              window.open(current?.downloadInfo?.link, "_blank");
            }}
          >
            Install {walletInfo?.prettyName}
          </Button>
        )}
      </div>
    );
  }

  if (modalView === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center gap-12 pt-6">
        <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
          <img className="h-full w-full" src={walletInfo?.logo} alt="" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-center text-h6 font-h6">Request Rejected</h1>
          <p className="body2 text-center text-wosmongton-100">
            {current?.rejectMessageTarget ?? "Connection permission denied."}
          </p>
        </div>
        <Button onClick={() => current?.connect(void 0, void 0, false)}>
          Reconnect
        </Button>
      </div>
    );
  }

  if (modalView === "connecting") {
    const {
      walletInfo: { prettyName, logo, mode },
      message,
    } = current!;

    let title: string = "Connecting Wallet";
    let desc: string =
      mode === "wallet-connect"
        ? `Approve ${prettyName} connection request on your mobile.`
        : `Open the ${prettyName} browser extension to connect your wallet.`;

    if (message === "InitClient") {
      title = "Initializing Wallet Client";
      desc = "";
    }

    return (
      <div className="flex flex-col items-center justify-center gap-12 pt-3">
        <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:animate-spin-slow after:rounded-full after:border-2 after:border-t-transparent after:border-b-transparent after:border-l-wosmongton-300 after:border-r-wosmongton-300">
          <img className="h-full w-full" src={logo} alt="" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-center text-h6 font-h6">{title}</h1>
          <p className="body2 text-center text-wosmongton-100">{desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {walletRepo.wallets?.map((wallet) => (
        <button
          className="flex items-center justify-center gap-3 rounded-xl border-2 border-osmoverse-500 py-2 hover:bg-wosmongton-400"
          key={wallet.walletName}
          onClick={() => wallet.connect()}
        >
          <img className="h-6 w-6" src={wallet.walletInfo.logo} alt="" />
          {wallet.walletInfo.prettyName}
        </button>
      ))}
    </div>
  );
};
