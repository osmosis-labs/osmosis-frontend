import { isNil } from "@osmosis-labs/utils";
import React, { ReactNode } from "react";

interface ErrorWalletStateProps {
  walletLogo?: string;
  title?: string;
  desc?: string;
  actions?: ReactNode;
}

export const ErrorWalletState = ({
  walletLogo,
  title,
  desc,
  actions,
}: ErrorWalletStateProps) => {
  return (
    <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-12 pt-6">
      <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:rounded-full after:border-2 after:border-error">
        {!!walletLogo && typeof walletLogo === "string" && (
          <img width={64} height={64} src={walletLogo} alt="Wallet logo" />
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {!isNil(title) && (
            <h1 className="text-center text-h6 font-h6">{title}</h1>
          )}
          {!isNil(desc) && (
            <p className="body2 text-center text-wosmongton-100">{desc}</p>
          )}
        </div>

        {actions}
      </div>
    </div>
  );
};
