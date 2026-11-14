import type { MappedLimitOrder } from "./types";

/**
 * When the order last changed: its cancel, its last payout, or its placement if nothing has filled.
 * Undefined when something happened after placement at a time we don't have: a fill on an active
 * order, or a payout on a closed order that Numia has no payout data for (orders placed before
 * 2026-11-09, until Numia backfills them).
 */
export function getOrderLastActivityAt(
  order: MappedLimitOrder
): number | undefined {
  if (order.cancelled_at) return order.cancelled_at;
  const lastClaim = order.claims?.[order.claims.length - 1];
  if (lastClaim) return lastClaim.claimed_at;
  if (
    order.status === "open" &&
    order.percentFilled.isZero() &&
    order.placed_at
  ) {
    return order.placed_at;
  }
  return undefined;
}
