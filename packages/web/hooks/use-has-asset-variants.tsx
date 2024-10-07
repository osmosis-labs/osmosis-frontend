import { useLocalStorage } from "react-use";

import {
  AlloyedAssetsToastDoNotShowKey,
  displayToast,
} from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { useFeatureFlags, useWindowSize } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useHasAssetVariants = () => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const { isMobile } = useWindowSize();
  const { alloyedAssets } = useFeatureFlags();

  const [doNotShowAgain, setDoNotShowAgain] = useLocalStorage(
    AlloyedAssetsToastDoNotShowKey,
    false
  );

  const enabled =
    alloyedAssets &&
    !doNotShowAgain &&
    Boolean(wallet?.isWalletConnected && wallet?.address);

  api.local.portfolio.getHasAssetVariants.useQuery(
    {
      address: wallet?.address ?? "",
    },
    {
      enabled,
      onSuccess: (data) => {
        const hasAssetsToConvert = data?.hasAssetVariants ?? false;
        const shouldDisplayToast = hasAssetsToConvert && !isMobile;

        if (shouldDisplayToast) {
          displayToast(
            {
              titleTranslationKey: "alloyedAssets.title",
              captionTranslationKey: "alloyedAssets.caption",
            },
            ToastType.ALLOYED_ASSETS,
            {
              position: "bottom-right",
            }
          );
        }
      },
      onError: (error) => {
        console.error(error);
      },
    }
  );
};
