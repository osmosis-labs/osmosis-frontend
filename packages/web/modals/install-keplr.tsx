import Link from "next/link";
import Image from "next/image";
import React, { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";

const KEPLER_OFFICIAL_URL = "https://www.keplr.app/";

export const KeplrInstallModal: FunctionComponent<ModalBaseProps & {}> = ({
  isOpen,
  onRequestClose,
}) => (
  <ModalBase
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    className="max-w-[30.625rem]"
    title={<h6 className="mb-4">Install Keplr Wallet Extension</h6>}
  >
    <p className="mb-5 caption text-white-mid">
      To interact with the osmosis application you will need to install the
      official keplr browser extenstion. You can do this by clicking on the
      button below and finding the install keplr button.
    </p>
    <button
      className="bg-background rounded-2xl p-5 flex items-center"
      onClick={(e) => {
        e.preventDefault();
        window.open(KEPLER_OFFICIAL_URL, "_blank");
        onRequestClose();
      }}
    >
      <Image
        src="/images/keplr-logo.png"
        alt="keplr logo"
        width={64}
        height={64}
      />
      <div className="flex flex-col text-left ml-5">
        <h6>Keplr&apos;s Official Website</h6>
        <p className="body2 text-iconDefault mt-1">{KEPLER_OFFICIAL_URL}</p>
      </div>
    </button>
  </ModalBase>
);
