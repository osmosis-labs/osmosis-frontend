import { ObservableSlippageConfig } from "@osmosis-labs/stores";
import { QuoteDirection } from "@osmosis-labs/tx";
import { Dec } from "@osmosis-labs/unit";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DefaultSlippage } from "~/config/swap";
import {
  AutoSlippageQuote,
  computeAutoSlippage,
  resolveSwapSlippage,
  slippageRequiredByFeeError,
} from "~/utils/slippage";

/** Creates the swap tool's slippage config: manual mode at the default, so
 *  it never falls back to a preset. Drive it with {@link useSwapSlippage}. */
export function useSwapSlippageConfig() {
  const [slippageConfig] = useState(() => {
    const config = new ObservableSlippageConfig();
    config.setDefaultSlippage(DefaultSlippage);
    config.setManualSlippage(DefaultSlippage);
    return config;
  });
  return slippageConfig;
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
 * Call from an observer component: it reads the config's override flag.
 */
export function useSwapSlippage({
  slippageConfig,
  quote,
  quoteType,
  feeError,
  isReviewOpen,
}: {
  slippageConfig: ObservableSlippageConfig;
  quote: AutoSlippageQuote | undefined;
  quoteType: QuoteDirection;
  feeError: Error | null | undefined;
  isReviewOpen: boolean;
}) {
  const liveAuto = useMemo(() => computeAutoSlippage(quote), [quote]);

  // Latch the auto tier when the review opens; release it when it closes.
  const [heldAuto, setHeldAuto] = useState<{
    isReviewOpen: boolean;
    auto: typeof liveAuto | undefined;
  }>({ isReviewOpen: false, auto: undefined });
  if (heldAuto.isReviewOpen !== isReviewOpen) {
    setHeldAuto({ isReviewOpen, auto: isReviewOpen ? liveAuto : undefined });
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
    quoteType,
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

  /** Call when the review closes: a value typed during one review does not
   *  carry into the next. Clearing on close rather than on open means the
   *  next review's first render already shows the app's value. */
  const resetForReview = useCallback(() => {
    slippageConfig.clearUserOverride();
  }, [slippageConfig]);

  /** Full reset after a trade. */
  const reset = useCallback(() => {
    slippageConfig.clearUserOverride();
    setFeeErrorState((prev) => ({ ...prev, slippage: undefined }));
  }, [slippageConfig]);

  return {
    source: resolved.source,
    /** True when the current quote's route liquidity is unknown. Read from
     *  the live quote even while the tier is latched for the review, so a
     *  refresh that loses the route's pricing still shows the warning. */
    liquidityUnknown:
      quoteType === "out-given-in" &&
      quote !== undefined &&
      liveAuto.liquidityUnknown,
    resetForReview,
    reset,
  };
}
