import { Dec } from "@osmosis-labs/unit";

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
    data: quote,
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

  return {
    quote,
    isLoading: isEnabled && isLoading,
    isError,
    error,
    isEnabled,
  };
}
