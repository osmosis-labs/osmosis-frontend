import { ObservableSlippageConfig } from "@osmosis-labs/stores";
import { QuoteDirection } from "@osmosis-labs/tx";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { DefaultSlippage } from "~/config/swap";
import {
  computeSuggestedSlippage,
  SuggestedSlippageQuote,
} from "~/utils/slippage";

/** Proactively adjusts slippage based on price impact and liquidity cap from the quote. */
export function useDynamicSlippageFromQuote({
  quote,
  slippageConfig,
  quoteType = "out-given-in",
}: {
  quote: SuggestedSlippageQuote | undefined;
  slippageConfig: ObservableSlippageConfig;
  quoteType?: QuoteDirection;
}) {
  // Synchronously compute the display value from the current quote so it updates
  // in the same React render cycle as the quote/gas display, not one cycle later.
  // Exact-out (in-given-out) quotes are excluded: SQS derives them by inverting
  // an exact-in quote, so their price impact and fee metadata cannot be trusted
  // for tier selection. Exact-out stays on the static default until SQS ships
  // true in-given-out routing.
  const autoAdjustedSlippage = useMemo(
    () =>
      quoteType === "in-given-out"
        ? DefaultSlippage
        : computeSuggestedSlippage(quote),
    [quote, quoteType]
  );

  // Tracks the last value written by this hook — used only as an optimisation to
  // skip redundant setManualSlippage calls when the suggestion hasn't changed.
  // It is NOT used to detect user overrides; that is the job of userOverrodeSlippage.
  const lastAutoSet = useRef<string | null>(null);

  // Keep the config in sync (for the actual transaction slippage).
  // Runs asynchronously after render — guarded against user overrides.
  useEffect(() => {
    if (!quote) return;

    // If useDynamicSlippageConfig (error hook) has called select() — don't override
    if (!slippageConfig.isManualSlippage) return;

    // No auto-adjustment for exact-out quotes (see autoAdjustedSlippage above).
    // Pin the config to the static default whenever the user has not
    // explicitly overridden it: this unwinds a previous exact-in auto-set on
    // direction switch AND corrects the store's legacy 0.5% boot value, so
    // the displayed default and the submitted tolerance cannot diverge.
    // Error-hook preset selections never reach here (isManualSlippage guard
    // above) and typed values are protected by userOverrodeSlippage.
    if (quoteType === "in-given-out") {
      lastAutoSet.current = null;
      if (
        !slippageConfig.userOverrodeSlippage &&
        slippageConfig.manualSlippageStr !== DefaultSlippage
      ) {
        slippageConfig.setManualSlippage(DefaultSlippage);
      }
      return;
    }

    // Explicit user override takes precedence — string equality is too fragile
    // (e.g. user types "0.5" which matches the tier string) so we rely on the
    // dedicated flag that review-order sets when the user edits the field.
    if (slippageConfig.userOverrodeSlippage) return;

    const suggested = computeSuggestedSlippage(quote);

    // Skip the write if the suggestion is unchanged (avoids a MobX reaction cycle)
    if (suggested === lastAutoSet.current) return;

    lastAutoSet.current = suggested;
    // setManualSlippage sets the actual slippage value (also sets isManualSlippage = true
    // so the slippage getter uses this value rather than the preset buttons).
    // Display is handled by autoAdjustedSlippage (computed synchronously via useMemo).
    slippageConfig.setManualSlippage(suggested);
  }, [
    quote,
    slippageConfig,
    quoteType,
    slippageConfig.isManualSlippage,
    slippageConfig.userOverrodeSlippage,
  ]);

  // Call this when slippage is externally reset (e.g. resetSlippage in swap-tool)
  // so the hook treats the next quote update as a fresh auto-adjust rather than
  // a user override.
  const resetAutoAdjust = useCallback(() => {
    lastAutoSet.current = null;
    slippageConfig.clearUserOverride();
  }, [slippageConfig]);

  return { autoAdjustedSlippage, resetAutoAdjust };
}
