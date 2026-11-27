import { useClZapQuote } from "~/hooks/use-cl-zap-quote";

export type { ClZapQuote as ZapOutQuote } from "~/hooks/use-cl-zap-quote";

export interface UseZapOutQuoteParams {
  /** Micro (raw) amount of the unwanted side being swapped out. */
  tokenInAmount: string;
  /** Denom of the unwanted side (the asset being sold). */
  tokenInDenom: string;
  /** Denom of the target asset (the asset being bought). */
  tokenOutDenom: string;
  /** Externally gate the query (e.g. single-asset mode off, or no swap needed). */
  enabled?: boolean;
}

/**
 * Quote hook for the concentrated-liquidity single-asset zap-out (exit) flow.
 * The swap leg is the exact reverse of zap-in: exact-in on the unwanted
 * withdrawn side to receive the target asset. Same exact-in router contract, so
 * this reuses `useClZapQuote` wholesale (kept as a distinct export so the exit
 * feature reads independently; the two can collapse to one in a follow-up once
 * both have shipped).
 *
 * Always an exact-in (out-given-in) quote; never inverts to exact-out.
 */
export function useZapOutQuote(params: UseZapOutQuoteParams) {
  return useClZapQuote(params);
}
