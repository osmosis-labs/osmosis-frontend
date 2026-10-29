import { useEffect } from "react";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { useFeatureFlags, useWalletSelect } from "~/hooks";
import {
  getToastEligibleVariantGroupKeys,
  shouldDisplayAlloyedAssetsToast,
} from "~/hooks/alloyed-assets-toast-policy";
import { useAlloyedAssetsToastDismissal } from "~/hooks/use-alloyed-assets-toast-dismissal";
import { useAlloyedAssetsToastSession } from "~/hooks/use-alloyed-assets-toast-session";
import { useConvertibleAssetVariants } from "~/hooks/use-convertible-asset-variants";
import { useForcedMigrations } from "~/hooks/use-forced-migrations";
import { useWallet } from "~/hooks/use-wallet";

export const useAssetVariantsToast = () => {
  // #region hooks & store
  const { address, isWalletConnected } = useWallet();
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { alloyedAssets } = useFeatureFlags();
  const { areAllGroupsDismissed, refresh } = useAlloyedAssetsToastDismissal();
  const {
    hasSeenToastThisSession,
    isSessionHydrated,
    markToastSeenThisSession,
  } = useAlloyedAssetsToastSession();
  // While a forced migration applies (snoozed or not) its popup is the only
  // conversion prompt, so the softer toast waits until none applies rather
  // than appearing alongside it.
  const { activeMigrations, isSettled: areForcedMigrationsSettled } =
    useForcedMigrations();
  const hasForcedMigration = activeMigrations.length > 0;

  // #region effects
  // Hydrate the shared store from localStorage once on the client. The gating
  // decision below reads storage directly so it does not depend on this, but
  // other consumers of `dismissedGroups` do.
  useEffect(() => refresh(), [refresh]);

  // #region queries
  // Dismissal is now per variant group, so the query must run even for a user
  // who dismissed before: we can only tell whether they hold a *new* alloy's
  // variant by looking at what they hold.
  // `alloyedAssets` is undefined until LaunchDarkly initialises; `Boolean`
  // keeps `enabled` false then, as React Query fetches on anything but false.
  const enabled =
    isSessionHydrated &&
    Boolean(alloyedAssets) &&
    !hasSeenToastThisSession &&
    !isWalletLoading &&
    isWalletConnected &&
    Boolean(address);

  const {
    assetVariants,
    portfolioQuery: { isFetchedAfterMount, isSuccess },
    isFetching,
    error,
  } = useConvertibleAssetVariants({ address, enabled, staleTime: 0 });

  useEffect(() => {
    // Only a settled, successful fetch this mount made while the gate was open
    // counts. The query can expose cached or persisted data while disabled,
    // keeps old data when a refetch fails, and a late cache restore can mark
    // it fetched mid-fetch; any of those would toast for a stale portfolio.
    if (
      !enabled ||
      !isSuccess ||
      isFetching ||
      !isFetchedAfterMount ||
      !assetVariants
    )
      return;
    if (hasSeenToastThisSession) return;
    // Wait until we know whether a forced migration applies.
    if (!areForcedMigrationsSettled || hasForcedMigration) return;

    // Eligibility and visibility live in alloyed-assets-toast-policy so the
    // release-critical rules are assertable without a component or a tRPC
    // client. Keep this callback to wiring only.
    const variantGroupKeys = getToastEligibleVariantGroupKeys(assetVariants);

    if (
      shouldDisplayAlloyedAssetsToast({
        variantGroupKeys,
        isAlloyedAssetsEnabled: alloyedAssets,
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
  }, [
    enabled,
    isSuccess,
    isFetching,
    isFetchedAfterMount,
    assetVariants,
    hasSeenToastThisSession,
    alloyedAssets,
    areAllGroupsDismissed,
    markToastSeenThisSession,
    hasForcedMigration,
    areForcedMigrationsSettled,
  ]);

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);
};
