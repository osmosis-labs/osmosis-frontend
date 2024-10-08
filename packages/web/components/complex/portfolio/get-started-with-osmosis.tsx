import { FunctionComponent } from "react";

import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useWalletSelect } from "~/hooks/use-wallet-select";
import { useStore } from "~/stores";

export const GetStartedWithOsmosis: FunctionComponent = () => {
  const { accountStore } = useStore();
  const { t } = useTranslation();

  const { onOpenWalletSelect } = useWalletSelect();

  return (
    <div className="flex max-w-sm flex-col gap-8">
      <p className="body1 text-osmoverse-400">{t("portfolio.connectWallet")}</p>
      <Button
        className="flex !h-11 w-fit items-center gap-2 !rounded-full !py-1"
        onClick={() => {
          onOpenWalletSelect({
            walletOptions: [
              { walletType: "cosmos", chainId: accountStore.osmosisChainId },
            ],
          });
        }}
      >
        {t("connectWallet")}
      </Button>
    </div>
  );
};
