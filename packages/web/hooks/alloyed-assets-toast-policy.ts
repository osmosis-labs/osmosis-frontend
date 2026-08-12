import type { AssetVariant } from "@osmosis-labs/server";

/**
 * Variant groups the proactive toast is allowed to advertise, deduplicated.
 *
 * Only groups whose canonical asset is alloyed qualify. `variantGroupKey` also
 * groups non-alloy canonical assets (legacy consolidations like MARS.old and
 * ASTRO.terra, and today's ibc-denom USDC with its ten bridged variants), and
 * volunteering those unprompted is noise.
 *
 * This narrows the unsolicited toast ONLY. Conversion itself stays available for
 * every variant group via the portfolio Convert button and the modal, so this
 * deliberately does not gate `checkAssetVariants` server-side.
 *
 * Deliberately a moving target: when a group's canonical asset becomes an alloy
 * (as USDC will), it starts qualifying with no code change here.
 */
export function getToastEligibleVariantGroupKeys(
  assetVariants: AssetVariant[] | undefined
): string[] {
  return [
    ...new Set(
      (assetVariants ?? [])
        .filter((variant) => variant.canonicalAsset?.isAlloyed)
        .map((variant) => variant.canonicalAsset.coinMinimalDenom)
    ),
  ];
}

/**
 * Whether to show the proactive toast for `variantGroupKeys`.
 *
 * Kept separate from the query callback so the release-critical visibility
 * policy is assertable without mounting a component or a tRPC client.
 */
export function shouldDisplayAlloyedAssetsToast({
  variantGroupKeys,
  isAlloyedAssetsEnabled,
  isMobile,
  areAllGroupsDismissed,
}: {
  variantGroupKeys: string[];
  isAlloyedAssetsEnabled: boolean;
  isMobile: boolean;
  /** Per-group dismissal check; see use-alloyed-assets-toast-dismissal. */
  areAllGroupsDismissed: (variantGroupKeys: string[]) => boolean;
}): boolean {
  if (!isAlloyedAssetsEnabled) return false;
  // Nothing eligible to advertise. Note an empty list would also be treated as
  // "all dismissed" below, so this guard is what keeps that from reading as a
  // reason to show the toast.
  if (variantGroupKeys.length === 0) return false;
  if (isMobile) return false;
  return !areAllGroupsDismissed(variantGroupKeys);
}

/**
 * Whether dismissing the toast should persist a suppression.
 *
 * Suppression is opt-in: it happens only when the user ticks "Don't show
 * again". Closing the toast with the box unticked just closes it, so the toast
 * can return in a future session.
 *
 * The polarity is the point. This was previously an inverted "Remind me later"
 * checkbox whose *unchecked* default suppressed permanently, so anyone who
 * closed the toast without reading it opted out of every alloy for good. Keep
 * this as a named function so that inversion cannot silently return.
 */
export function shouldPersistDismissalOnClose(
  isDontShowAgainChecked: boolean
): boolean {
  return isDontShowAgainChecked;
}
