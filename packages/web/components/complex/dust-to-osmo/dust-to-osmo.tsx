import { useState } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { useTranslation, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { HideDustUserSetting } from "~/stores/user-settings";
import { api } from "~/utils/trpc";

export function DustToOsmo() {
  const { t } = useTranslation();

  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  const [loadDustAssets, setLoadDustAssets] = useState(false);

  const { data: dustAssets, isLoading: isLoadingDust } =
    api.edge.assets.getUserDustAssets.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
        // TODO(Greg): the dust threshold has changed to 0.02.
        // Is it ok to use this or should I use the 0.01 which was specified?
        dustThreshold: HideDustUserSetting.DUST_THRESHOLD,
      },
      {
        enabled:
          !isLoadingWallet && Boolean(account?.address) && loadDustAssets,
        cacheTime: 0,
      }
    );

  return (
    <>
      <Button
        className="gap-2 !border !border-osmoverse-700 !py-2 !px-4 !text-wosmongton-200"
        variant="outline"
        size="lg-full"
        isLoading={isLoadingDust}
        onClick={() => setLoadDustAssets(true)}
      >
        <Icon id="dust-broom" className="h-6 w-6" />
        {t("dustToOsmo.mainButton")}
      </Button>
      {dustAssets && dustAssets.length > 0 && (
        <div className="flex flex-col gap-2">
          {dustAssets.map((asset) => (
            <div key={asset.coinDenom}>{asset.coinDenom}</div>
          ))}
        </div>
      )}
    </>
  );
}
