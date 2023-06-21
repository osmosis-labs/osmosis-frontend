import Image from "next/image";
import Link from "next/link";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { ModalBase, ModalBaseProps } from "./base";

export const KeplrConnectionSelectModal: FunctionComponent<
  ModalBaseProps & {
    overrideWithKeplrInstallLink?: string;
    onSelectExtension: () => void;
    onSelectWalletConnect: () => void;
  }
> = ({
  isOpen,
  onRequestClose,
  overrideWithKeplrInstallLink,
  onSelectExtension,
  onSelectWalletConnect,
}) => {
  const t = useTranslation();
  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-w-[30.625rem]"
      title={<h6 className="mb-4">{t("connectWallet")}</h6>}
    >
      {overrideWithKeplrInstallLink ? (
        <button
          className="flex items-center rounded-2xl bg-osmoverse-900 p-5 transition-colors hover:bg-osmoverse-700"
          onClick={(e) => {
            e.preventDefault();
            window.open(overrideWithKeplrInstallLink, "_blank");
          }}
        >
          <Image
            src="/images/keplr-logo.svg"
            alt="keplr logo"
            width={64}
            height={64}
          />
          <div className="ml-5 flex flex-col text-left">
            <div className="flex items-center gap-2">
              <h6>{t("keplr.install")}</h6>
              <Image
                src="/icons/external-link-white.svg"
                alt="external link"
                width={14}
                height={14}
              />
            </div>
            <p className="body2 mt-1 text-osmoverse-400">
              {overrideWithKeplrInstallLink}
            </p>
          </div>
        </button>
      ) : (
        <button
          className="flex items-center rounded-2xl bg-osmoverse-900 p-5 transition-colors hover:bg-osmoverse-700"
          onClick={(e) => {
            e.preventDefault();
            onSelectExtension();
          }}
        >
          <Image
            src="/images/keplr-logo.svg"
            alt="keplr logo"
            width={64}
            height={64}
          />
          <div className="ml-5 flex flex-col text-left">
            <h6>{t("keplr.wallet")}</h6>
            <p className="body2 mt-1 text-osmoverse-400">
              {t("keplr.extension")}
            </p>
          </div>
          <p className="body2 mt-1 text-osmoverse-400">
            {overrideWithKeplrInstallLink}
          </p>
        </button>
      )}
      <button
        className="mt-5 flex items-center rounded-2xl bg-osmoverse-900 p-5 transition-colors hover:bg-osmoverse-700"
        onClick={(e) => {
          e.preventDefault();
          onSelectWalletConnect();
        }}
      >
        <Image
          src="/icons/walletconnect.svg"
          alt="wallet connect logo"
          width={64}
          height={64}
        />
        <div className="ml-5 flex flex-col text-left">
          <h6>{t("keplr.walletConnect")}</h6>
          <p className="body2 mt-1 text-osmoverse-400">{t("keplr.mobile")}</p>
        </div>
      </button>
      <div className="mt-5 rounded-2xl bg-osmoverse-700 p-5">
        <p className="caption text-white-mid">
          {t("connectDisclaimer")}{" "}
          <Link href="/disclaimer" passHref>
            <a className="underline" target="_blank" rel="noopener noreferrer">
              {t("protocolDisclaimer")}
            </a>
          </Link>
          .
        </p>
      </div>
    </ModalBase>
  );
};
