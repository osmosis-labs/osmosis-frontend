import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";

import {
  AlloyedAssetsToastDoNotShowKey,
  displayToast,
} from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { useFeatureFlags, useWalletSelect, useWindowSize } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useHasAssetVariants = () => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isWalletLoading } = useWalletSelect();

  // Check for component mounted
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const { isMobile } = useWindowSize();
  const { alloyedAssets } = useFeatureFlags();

  const [doNotShowAgain] = useLocalStorage(
    AlloyedAssetsToastDoNotShowKey,
    false
  );

  api.local.portfolio.getAllocation.useQuery(
    {
      address: wallet?.address ?? "",
    },
    {
      enabled:
        isMounted &&
        alloyedAssets &&
        !doNotShowAgain &&
        !isWalletLoading &&
        Boolean(wallet?.isWalletConnected) &&
        Boolean(wallet?.address),
      onSuccess: (data) => {
        const hasAssetsToConvert = data?.hasVariants ?? false;
        const shouldDisplayToast =
          hasAssetsToConvert && !isMobile && !doNotShowAgain;

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
      refetchOnWindowFocus: false,
    }
  );
};
