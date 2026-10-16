import { FunctionComponent } from "react";

import { Button } from "~/components/ui/button";
import { OsmosisChainInfo } from "~/config/chain";
import { useTranslation } from "~/hooks";
import { useWalletSelect } from "~/hooks/use-wallet-select";

export const GetStartedWithOsmosis: FunctionComponent = () => {
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
              { walletType: "cosmos", chainId: OsmosisChainInfo.chainId },
            ],
          });
        }}
      >
        {t("connectWallet")}
      </Button>
    </div>
  );
};
