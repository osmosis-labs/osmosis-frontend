import type { MappedLimitOrder } from "./types";

export type OrderActivity = {
  action: "placed" | "paidOut" | "cancelled";
  at: number;
};

/**
 * The latest known event on an order. Undefined when something happened after placement at a
 * time we don't have: a fill on an active order, or a payout on a closed order that Numia has no
 * payout data for (orders placed before 2026-11-09, until Numia backfills them).
 */
export function getOrderLastActivity(
  order: MappedLimitOrder
): OrderActivity | undefined {
  if (order.cancelled_at) {
    return { action: "cancelled", at: order.cancelled_at };
  }
  const lastClaim = order.claims?.[order.claims.length - 1];
  if (lastClaim) {
    return { action: "paidOut", at: lastClaim.claimed_at };
  }
  if (
    order.status === "open" &&
    order.percentFilled.isZero() &&
    order.placed_at
  ) {
    return { action: "placed", at: order.placed_at };
  }
  return undefined;
}
