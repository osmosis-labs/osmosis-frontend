import { useEffect } from "react";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { useFeatureFlags, useWalletSelect, useWindowSize } from "~/hooks";
import {
  getToastEligibleVariantGroupKeys,
  shouldDisplayAlloyedAssetsToast,
} from "~/hooks/alloyed-assets-toast-policy";
import { useAlloyedAssetsToastDismissal } from "~/hooks/use-alloyed-assets-toast-dismissal";
import { useAlloyedAssetsToastSession } from "~/hooks/use-alloyed-assets-toast-session";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useAssetVariantsToast = () => {
  // #region hooks & store
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { isMobile } = useWindowSize();
  const { alloyedAssets } = useFeatureFlags();
  const { areAllGroupsDismissed, refresh } = useAlloyedAssetsToastDismissal();
  const {
    hasSeenToastThisSession,
    isSessionHydrated,
    markToastSeenThisSession,
  } = useAlloyedAssetsToastSession();

  // #region effects
  // Hydrate the shared store from localStorage once on the client. The gating
  // decision below reads storage directly so it does not depend on this, but
  // other consumers of `dismissedGroups` do.
  useEffect(() => refresh(), [refresh]);

  // #region queries
  // Dismissal is now per variant group, so the query must run even for a user
  // who dismissed before: we can only tell whether they hold a *new* alloy's
  // variant by looking at what they hold.
  const enabled =
    isSessionHydrated &&
    alloyedAssets &&
    !hasSeenToastThisSession &&
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
        if (hasSeenToastThisSession) return;

        // Eligibility and visibility live in alloyed-assets-toast-policy so the
        // release-critical rules are assertable without a component or a tRPC
        // client. Keep this callback to wiring only.
        const variantGroupKeys = getToastEligibleVariantGroupKeys(
          data?.assetVariants
        );

        if (
          shouldDisplayAlloyedAssetsToast({
            variantGroupKeys,
            isAlloyedAssetsEnabled: alloyedAssets,
            isMobile,
            areAllGroupsDismissed,
          })
        ) {
          displayToast(
            {
              titleTranslationKey: "alloyedAssets.title",
              captionTranslationKey: "alloyedAssets.caption",
              variantGroupKeys,
            },
            ToastType.ALLOYED_ASSETS,
            {
              position: "bottom-right",
            }
          );

          markToastSeenThisSession();
        }
      },
      onError: (error) => {
        console.error(error);
      },
      refetchOnWindowFocus: false,
    }
  );
};
