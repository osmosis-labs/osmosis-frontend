import Image from "next/image";
import React from "react";
import { FunctionComponent } from "react";

import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useWalletSelect } from "~/hooks/wallet-select";
import { useStore } from "~/stores";

export const NoTransactionsSplash: FunctionComponent<{
  variant: "transfers" | "transactions" | "connect";
}> = ({ variant }) => {
  const { chainStore } = useStore();
  const osmosisChainId = chainStore.osmosis.chainId;
  const { onOpenWalletSelect } = useWalletSelect();

  const { t } = useTranslation();

  const getTitle = () => {
    if (variant === "transfers") return t("transactions.noRecent");
    if (variant === "transactions") return t("transactions.noTransactions");
    if (variant === "connect") return t("transactions.connectToSee");
  };

  const getBodyText = () => {
    if (variant === "transfers") return t("transactions.recentShownHere");
    if (variant === "transactions") return t("transactions.pastShownHere");
    if (variant === "connect") return t("transactions.pastShownHere");
  };

  return (
    <div className="mx-auto my-6 flex max-w-35 flex-col gap-6 text-center">
      <Image
        className="mx-auto"
        src="/images/ion-thumbs-up.svg"
        alt="ion thumbs up"
        width="260"
        height="160"
      />
      <div className="flex flex-col gap-2">
        <h6>{getTitle()}</h6>
        <p className="body1 text-osmoverse-300">{getBodyText()}</p>
      </div>
      {variant === "connect" && (
        <div className="max-w-56">
          <Button onClick={() => onOpenWalletSelect(osmosisChainId)} size="md">
            {t("connectWallet")}
          </Button>
        </div>
      )}
    </div>
  );
};
