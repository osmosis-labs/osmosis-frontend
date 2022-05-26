import React, { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";
import Image from "next/image";

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
    title={<h6 className="mt-1 mb-4">Connect Wallet</h6>}
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
  </ModalBase>
);
