import Link from "next/link";
import Image from "next/image";
import React, { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";

export const KeplrConnectionSelectModal: FunctionComponent<
  ModalBaseProps & {
    onSelectExtension: () => void;
    onSelectWalletConnect: () => void;
  }
> = ({ isOpen, onRequestClose, onSelectExtension, onSelectWalletConnect }) => (
  <ModalBase
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    className="max-w-[30.625rem]"
    title={<h6 className="mb-4">Connect Wallet</h6>}
  >
    <button
      className="bg-background rounded-2xl p-5 flex items-center"
      onClick={(e) => {
        e.preventDefault();
        onSelectExtension();
      }}
    >
      <Image
        src="/images/keplr-logo.png"
        alt="keplr logo"
        width={64}
        height={64}
      />
      <div className="flex flex-col text-left ml-5">
        <h6>Keplr Wallet</h6>
        <p className="body2 text-iconDefault mt-1">Keplr Browser Extension</p>
      </div>
    </button>
    <button
      className="bg-background rounded-2xl p-5 flex items-center mt-5"
      onClick={(e) => {
        e.preventDefault();
        onSelectWalletConnect();
      }}
    >
      <Image
        src="/images/wallet-connect-logo.png"
        alt="wallet connect logo"
        width={64}
        height={64}
      />
      <div className="flex flex-col text-left ml-5">
        <h6>WalletConnect</h6>
        <p className="body2 text-iconDefault mt-1">Keplr Mobile</p>
      </div>
    </button>
    <div className="mt-5 p-5 rounded-2xl bg-card">
      <p className="caption text-white-mid">
        By connecting a wallet, you acknowledge that you have read and
        understand the Osmosis{" "}
        <Link href="/disclaimer" passHref>
          <a className="underline" target="_blank" rel="noopener noreferrer">
            Protocol Disclaimer
          </a>
        </Link>
        .
      </p>
    </div>
  </ModalBase>
);
