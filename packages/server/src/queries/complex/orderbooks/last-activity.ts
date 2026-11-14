import type { MappedLimitOrder } from "./types";

/**
 * When the order last changed: its cancel or its last payout. Undefined when it has neither, or
 * when Numia has no payout data for it (orders placed before 2026-11-09, until Numia backfills them).
 */
export function getOrderLastActivityAt(
  order: MappedLimitOrder
): number | undefined {
  if (order.cancelled_at) return order.cancelled_at;
  return order.claims?.[order.claims.length - 1]?.claimed_at;
}
