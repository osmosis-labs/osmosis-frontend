import { isNil } from "@osmosis-labs/utils";
import React from "react";

interface SwitchingNetworkStateProps {
  walletLogo?: string;
  title?: string;
  desc?: string;
  walletName?: string;
}

export const SwitchingNetworkState = ({
  walletLogo,
  title: titleProp,
  desc: descProp,
  walletName,
}: SwitchingNetworkStateProps) => {
  const title = titleProp ?? "Switching network";
  const desc =
    descProp ??
    `Open the ${walletName} browser extension to approve the network switch.`;

  return (
    <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-12 pt-3">
      <div className="flex h-16 w-16 items-center justify-center after:absolute after:h-32 after:w-32 after:animate-spin-slow after:rounded-full after:border-2 after:border-b-transparent after:border-l-wosmongton-300 after:border-r-wosmongton-300 after:border-t-transparent">
        {!!walletLogo && typeof walletLogo === "string" && (
          <img width={64} height={64} src={walletLogo} alt="Wallet logo" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        {!isNil(title) && (
          <h1 className="text-center text-h6 font-h6">{title}</h1>
        )}
        {!isNil(desc) && (
          <p className="body2 text-center text-wosmongton-100">{desc}</p>
        )}
      </div>
    </div>
  );
};
