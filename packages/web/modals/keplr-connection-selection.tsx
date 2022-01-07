import React, { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";

export const KeplrConnectionSelectModal: FunctionComponent<
  ModalBaseProps & {
    onSelectExtension: () => void;
    onSelectWalletConnect: () => void;
  }
> = ({ isOpen, onRequestClose, onSelectExtension, onSelectWalletConnect }) => {
  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex flex-col"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          onSelectExtension();
        }}
      >
        extension
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          onSelectWalletConnect();
        }}
      >
        wallet connect
      </button>
    </ModalBase>
  );
};
