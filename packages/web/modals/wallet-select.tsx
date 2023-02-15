import { ChainWalletBase } from "@cosmos-kit/core";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { ModalBase, ModalBaseProps } from "./base";

export const WalletSelectModal: FunctionComponent<
  ModalBaseProps & { wallets: ChainWalletBase[] }
> = ({ isOpen, onRequestClose, wallets }) => {
  const t = useTranslation();

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-w-[30.625rem]"
      title={<h6 className="mb-4">{t("connectWallet")}</h6>}
    >
      <div className="flex flex-col gap-2">
        {wallets.map((wallet) => (
          <button
            className="rounded-xl border-2 border-osmoverse-500 py-2 hover:bg-wosmongton-400"
            key={wallet.walletName}
            onClick={() => wallet.connect()}
          >
            {wallet.walletPrettyName}
          </button>
        ))}
      </div>
    </ModalBase>
  );
};
