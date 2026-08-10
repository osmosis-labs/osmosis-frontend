import { useEffect } from "react";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { useFeatureFlags, useWalletSelect, useWindowSize } from "~/hooks";
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

        const assetVariants = data?.assetVariants ?? [];
        // Only nag proactively for alloys. `variantGroupKey` also groups
        // non-alloy canonical assets (legacy consolidations like MARS.old and
        // ASTRO.terra, and today's ibc-denom USDC with its ten bridged
        // variants), and volunteering those unprompted is noise. Conversion
        // itself stays available for every variant group via the portfolio
        // Convert button and the modal; this filter narrows only the unsolicited
        // toast, so it deliberately does NOT gate `checkAssetVariants`.
        //
        // Note this is a moving target by design: when a group's canonical asset
        // becomes an alloy (as USDC will), it starts qualifying here with no code
        // change.
        const variantGroupKeys = [
          ...new Set(
            assetVariants
              .filter((variant) => variant.canonicalAsset.isAlloyed)
              .map((variant) => variant.canonicalAsset.coinMinimalDenom)
          ),
        ];

        const hasAssetsToConvert = variantGroupKeys.length > 0;

        const shouldDisplayToast =
          alloyedAssets &&
          hasAssetsToConvert &&
          !isMobile &&
          !areAllGroupsDismissed(variantGroupKeys);

        if (shouldDisplayToast) {
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
