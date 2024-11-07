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

export const useAssetVariantsToast = () => {
  // #region state
  const [hasSeenToastThisSession, setHasSeenToastThisSession] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [doNotShowAgain] = useLocalStorage<boolean>(
    AlloyedAssetsToastDoNotShowKey
  );

  // #region hooks & store
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { isMobile } = useWindowSize();
  const { alloyedAssets } = useFeatureFlags();

  // #region effects
  useEffect(() => setIsMounted(true), []);

  // #region queries
  const enabled =
    isMounted &&
    alloyedAssets &&
    !hasSeenToastThisSession &&
    !doNotShowAgain &&
    !isWalletLoading &&
    Boolean(wallet?.isWalletConnected) &&
    Boolean(wallet?.address);

  api.local.portfolio.getPortfolioAssets.useQuery(
    {
      address: wallet?.address ?? "",
    },
    {
      enabled,
      onSuccess: (data) => {
        if (doNotShowAgain || hasSeenToastThisSession) return;

        const hasAssetsToConvert = data?.assetVariants?.length > 0 || false;

        const shouldDisplayToast =
          alloyedAssets && hasAssetsToConvert && !isMobile;

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

          setHasSeenToastThisSession(true);
        }
      },
      onError: (error) => {
        console.error(error);
      },
      refetchOnWindowFocus: false,
    }
  );
};
