import { Dec } from "@osmosis-labs/unit";

import { useLatestWhen } from "~/hooks/use-latest-when";
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
      gcTime: 5_000,
      refetchInterval: 5_000,
      retry: false,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  // Hold the last successful quote while the next request loads, so the
  // breakdown doesn't collapse when the swap amount moves (it is re-derived
  // from the pool's live price every refetch). The reset key is the direction
  // only: reusing an opposite-direction quote would compose its route with
  // the new token-in denom, so a side switch drops it and the consumer shows
  // loading. A held quote for an older amount is flagged `isRefreshing` and
  // must not be submitted.
  const heldQuote = useLatestWhen(
    freshQuote,
    (quote) => Boolean(quote),
    `${tokenInDenom}|${tokenOutDenom}`
  );

  // Don't fall back to the held quote when the latest fetch errored: holding it
  // would render a valid-looking breakdown while submit is silently disabled.
  // Dropping it lets the consumer show the error (typed `routerError`) instead.
  const quote = freshQuote ?? (isError ? undefined : heldQuote);

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
    /** Showing a held quote for a previous amount while the current one loads. */
    isRefreshing: isEnabled && !freshQuote && Boolean(quote),
    isError,
    error,
    /** Typed router error for `tError`-based copy; undefined when no error. */
    routerError,
    isEnabled,
  };
}
