import { QuoteDirection } from "@osmosis-labs/tx";
import { Dec } from "@osmosis-labs/unit";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DefaultSlippage } from "~/config/swap";
import {
  type SlippageConfig,
  useSlippageConfig,
} from "~/hooks/ui-config/use-slippage-config";
import {
  AutoSlippageQuote,
  computeAutoSlippage,
  resolveSwapSlippage,
  slippageRequiredByFeeError,
} from "~/utils/slippage";

/** Creates the swap tool's slippage config. {@link useSwapSlippage} keeps it
 *  in manual mode on the resolved value, so it never falls back to a preset,
 *  including the preset the config selects when it mounts. */
export function useSwapSlippageConfig(): SlippageConfig {
  return useSlippageConfig({ defaultSlippage: DefaultSlippage });
}

/**
 * The only code that sets the swap tool's slippage, apart from the user
 * typing into the review modal.
 *
 * The submitted slippage resolves, in priority order, to: a value the user
 * typed, a tier a fee simulation error requires, the tier picked from the
 * quote, then the default. The config always holds that value in manual
 * mode, so what the review displays is what the transaction submits.
 *
 * While the review is open the auto tier is held at the value it had when
 * the review opened, so a quote refresh that crosses a tier boundary cannot
 * change the tolerance under the user's eyes (the quote-drift check compares
 * against the tolerance, so a widening alone would go unnoticed). A typed
 * value or a fee-error raise still applies.
 *
 * The hold starts from the first quote for the current input. Between a
 * keystroke and its quote, `quote` is still the previous input's quote; a
 * review opened in that window would otherwise hold that quote's tier for a
 * trade it was never computed for.
 */
export function useSwapSlippage({
  slippageConfig,
  quote,
  quoteType,
  feeError,
  isReviewOpen,
  isQuoteSettled,
}: {
  slippageConfig: SlippageConfig;
  quote: AutoSlippageQuote | undefined;
  quoteType: QuoteDirection;
  feeError: Error | null | undefined;
  isReviewOpen: boolean;
  /** False while the input is being typed or its quote is loading, when
   *  `quote` still belongs to the previous input. */
  isQuoteSettled: boolean;
}) {
  const liveAuto = useMemo(() => computeAutoSlippage(quote), [quote]);

  // Latch the auto tier when the review opens on a settled quote, or on the
  // first settled quote after it opens; release it when the review closes.
  // A settled input can still have no quote (the router dropped a zero-amount
  // one), and the default tier must not be held over the quote that follows.
  const canLatch = isQuoteSettled && quote !== undefined;
  const [heldAuto, setHeldAuto] = useState<{
    isReviewOpen: boolean;
    auto: typeof liveAuto | undefined;
  }>({ isReviewOpen: false, auto: undefined });
  if (heldAuto.isReviewOpen !== isReviewOpen) {
    setHeldAuto({
      isReviewOpen,
      auto: isReviewOpen && canLatch ? liveAuto : undefined,
    });
  } else if (isReviewOpen && heldAuto.auto === undefined && canLatch) {
    setHeldAuto({ isReviewOpen, auto: liveAuto });
  }
  const auto =
    isReviewOpen && heldAuto.isReviewOpen && heldAuto.auto
      ? heldAuto.auto
      : liveAuto;

  // A fee error's required tier sticks until reset or a direction switch:
  // once the raised tolerance lets the simulation succeed, the error goes
  // away, and dropping back would only reproduce it.
  const [feeErrorState, setFeeErrorState] = useState<{
    lastError: Error | null | undefined;
    quoteType: QuoteDirection;
    slippage: string | undefined;
  }>({ lastError: feeError, quoteType, slippage: undefined });
  if (feeErrorState.quoteType !== quoteType) {
    setFeeErrorState({ lastError: feeError, quoteType, slippage: undefined });
  } else if (feeErrorState.lastError !== feeError) {
    const required = slippageRequiredByFeeError({
      errorMessage: feeError?.message,
      quoteType,
      currentSlippage: slippageConfig.slippage.toDec(),
    });
    const held = feeErrorState.slippage;
    setFeeErrorState({
      lastError: feeError,
      quoteType,
      slippage:
        required !== undefined &&
        (held === undefined || new Dec(required).gt(new Dec(held)))
          ? required
          : held,
    });
  }

  const resolved = resolveSwapSlippage({
    userSlippage: slippageConfig.userOverrodeSlippage
      ? slippageConfig.manualSlippageStr
      : undefined,
    feeErrorSlippage: feeErrorState.slippage,
    autoSlippage: auto.slippage,
  });

  // Keep the config on the resolved value. Runs after every render and only
  // writes on a change; user-typed values are left alone.
  useEffect(() => {
    if (resolved.source === "user") return;
    if (
      slippageConfig.isManualSlippage &&
      slippageConfig.manualSlippageStr === resolved.slippage
    )
      return;
    slippageConfig.setManualSlippage(resolved.slippage);
  });

  const { clearUserOverride } = slippageConfig;

  /** Call when the review closes: a value typed during one review does not
   *  carry into the next. Clearing on close rather than on open means the
   *  next review's first render already shows the app's value. */
  const resetForReview = useCallback(() => {
    clearUserOverride();
  }, [clearUserOverride]);

  /** Full reset after a trade. */
  const reset = useCallback(() => {
    clearUserOverride();
    setFeeErrorState((prev) => ({ ...prev, slippage: undefined }));
  }, [clearUserOverride]);

  return {
    source: resolved.source,
    /** True when the current quote's route liquidity is unknown. Read from
     *  the live quote even while the tier is latched for the review, so a
     *  refresh that loses the route's pricing still shows the warning. */
    liquidityUnknown: quote !== undefined && liveAuto.liquidityUnknown,
    resetForReview,
    reset,
  };
}
