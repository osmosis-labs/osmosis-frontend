import { Dec } from "@osmosis-labs/unit";

import { usePreviousWhen } from "~/hooks/use-previous-when";
import { makeRouterErrorFromTrpcError } from "~/hooks/use-swap";
import { api, RouterOutputs } from "~/utils/trpc";

/** SQS out-given-in quote, as returned by the local quote router. */
export type ClZapQuote =
  RouterOutputs["local"]["quoteRouter"]["routeTokenOutGivenIn"];

export interface UseClZapQuoteParams {
  /** Micro (raw) amount of the asset being swapped in. */
  tokenInAmount: string;
  tokenInDenom: string;
  tokenOutDenom: string;
  /** Externally gate the query (e.g. single-asset mode off, or no swap needed). */
  enabled?: boolean;
}

/**
 * Slim hook for the concentrated-liquidity single-asset zap-in flow. Quotes the
 * optimal swap leg via `routeTokenOutGivenIn` (exact-in), and returns the SQS
 * quote verbatim — route, spread factor and price impact are surfaced as-is by
 * the consumer, not recomputed.
 *
 * Deliberately NOT built on `useSwap`: that hook is tied to the swap-tool's
 * input/output slots, slippage UI and EVM bridging, which is the wrong shape
 * for a CL modal consumer.
 *
 * Always an exact-in (out-given-in) quote. The query is disabled for a
 * non-positive input so it can never fall through to an inverted exact-out
 * (`routeTokenInGivenOut`) request.
 */
export function useClZapQuote({
  tokenInAmount,
  tokenInDenom,
  tokenOutDenom,
  enabled = true,
}: UseClZapQuoteParams) {
  let hasPositiveInput = false;
  try {
    hasPositiveInput =
      Boolean(tokenInAmount) && new Dec(tokenInAmount).gt(new Dec(0));
  } catch {
    hasPositiveInput = false;
  }

  const isEnabled =
    enabled &&
    hasPositiveInput &&
    Boolean(tokenInDenom) &&
    Boolean(tokenOutDenom) &&
    tokenInDenom !== tokenOutDenom;

  const {
    data: freshQuote,
    isLoading,
    isError,
    error,
  } = api.local.quoteRouter.routeTokenOutGivenIn.useQuery(
    {
      tokenInAmount,
      tokenInDenom,
      tokenOutDenom,
    },
    {
      enabled: isEnabled,
      // Quotes go stale quickly — a stale quote makes the swap leg's gas
      // simulation fail on slippage. Mirror the swap-tool's cadence.
      staleTime: 5_000,
      cacheTime: 5_000,
      refetchInterval: 5_000,
      retry: false,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  // Hold the last successful quote so the breakdown doesn't collapse to a
  // spinner on each 5s background refetch (mirrors the swap tool's
  // `usePreviousWhen` over its quote). The full request context is captured
  // alongside the quote so the fallback below can verify it.
  const previousHeld = usePreviousWhen(
    freshQuote
      ? { quote: freshQuote, tokenInAmount, tokenInDenom, tokenOutDenom }
      : undefined,
    (held) => Boolean(held)
  );

  // Only fall back to the held quote when it was computed for the SAME request:
  // amount, input denom AND output denom. Amount alone is not enough — in a
  // centered range, switching the provided side commonly produces the identical
  // swap amount, and reusing the opposite-direction quote would compose its
  // route with the new token-in denom. After any of the three changes we let it
  // show loading in that brief window rather than render a mismatched quote.
  const heldMatchesInput =
    previousHeld &&
    previousHeld.tokenInAmount === tokenInAmount &&
    previousHeld.tokenInDenom === tokenInDenom &&
    previousHeld.tokenOutDenom === tokenOutDenom;

  // Don't fall back to the held quote when the latest fetch errored: holding it
  // would render a valid-looking breakdown while submit is silently disabled.
  // Dropping it lets the consumer show the error (typed `routerError`) instead.
  // The flicker the hold prevents only applies to transient success refetches.
  const quote =
    freshQuote ??
    (heldMatchesInput && !isError ? previousHeld.quote : undefined);

  // Map the raw SQS/tRPC error string to a typed router error (NoRouteError /
  // NotEnoughLiquidityError / NotEnoughQuotedError / generic), reusing the swap
  // tool's mapper so the consumer can show the accurate cause via `tError`
  // rather than a single catch-all message.
  const routerError = makeRouterErrorFromTrpcError(error?.message)?.error;

  return {
    quote,
    // Only surface loading on the genuine first fetch (no quote to show yet),
    // not on background refetches — that's what caused the flicker.
    isLoading: isEnabled && isLoading && !quote,
    isError,
    error,
    /** Typed router error for `tError`-based copy; undefined when no error. */
    routerError,
    isEnabled,
  };
}
