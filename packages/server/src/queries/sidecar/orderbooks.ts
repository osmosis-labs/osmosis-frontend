import { apiClient, ApiClientError } from "@osmosis-labs/utils";

import { SIDECAR_BASE_URL } from "../../env";

export type CanonicalOrderbooksResponse = {
  base: string;
  quote: string;
  pool_id: number;
  contract_address: string;
}[];

export interface SQSActiveOrder {
  tick_id: number;
  order_id: number;
  order_direction: "bid" | "ask";
  owner: string;
  quantity: string;
  etas: string;
  placed_quantity: string;
  placed_at: number;
  price: string;
  percentClaimed: string;
  totalFilled: string;
  percentFilled: string;
  orderbookAddress: string;
  status: "open" | "partiallyFilled";
  output: string;
  quote_asset: {
    symbol: string;
  };
  base_asset: {
    symbol: string;
  };
}

export type ActiveOrdersResponse = {
  orders: SQSActiveOrder[];
};

export async function queryCanonicalOrderbooks() {
  const url = new URL("/pools/canonical-orderbooks", SIDECAR_BASE_URL);
  return await apiClient<CanonicalOrderbooksResponse>(url.toString());
}

export async function queryActiveOrdersSQS({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}) {
  const url = new URL(
    `/passthrough/active-orders?userOsmoAddress=${userOsmoAddress}`,
    SIDECAR_BASE_URL
  );
  return await apiClient<ActiveOrdersResponse>(url.toString());
}

interface SQSOrderbookTickValues {
  /** Integer string in the minimal denom of the side's input asset. */
  total_amount_of_liquidity: string;
  cumulative_total_value: string;
  effective_total_amount_swapped: string;
  cumulative_realized_cancels: string;
  last_tick_sync_etas: string;
}

export interface SQSOrderbookTick {
  tick_id: number;
  tick_state: {
    ask_values: SQSOrderbookTickValues;
    bid_values: SQSOrderbookTickValues;
  };
}

export type OrderbookTicksSQSUnavailableReason =
  | "not-orderbook"
  | "not-ingested"
  | "malformed";

export type OrderbookTicksSQSResult =
  | { status: "ok"; ticks: SQSOrderbookTick[] }
  | { status: "unavailable"; reason: OrderbookTicksSQSUnavailableReason };

/**
 * Status codes the orderbook-ticks endpoint uses to say "no depth data for this
 * pool", as opposed to an empty book (200 with an empty ticks array).
 * Anything else that fails (network error, gateway error) is thrown so the
 * caller can keep showing its last good data.
 */
const ORDERBOOK_TICKS_UNAVAILABLE_STATUSES: Record<
  number,
  OrderbookTicksSQSUnavailableReason
> = {
  404: "not-orderbook",
  503: "not-ingested",
  500: "malformed",
};

/**
 * Fetches every tick with liquidity on either side for an orderbook pool,
 * sorted by ascending tick id, from the SQS tick ingestion.
 *
 * A 200 with an empty ticks array is a genuinely empty book. A 404 (not an
 * orderbook), 503 (ticks not ingested yet) or 500 (malformed tick state) is
 * returned as `unavailable` and must never be rendered as zero depth.
 */
export async function queryOrderbookTicksSQS({
  poolId,
}: {
  poolId: string;
}): Promise<OrderbookTicksSQSResult> {
  const url = new URL("/passthrough/orderbook-ticks", SIDECAR_BASE_URL);
  url.searchParams.set("poolID", poolId);

  let data: { ticks?: unknown };
  try {
    data = await apiClient<{ ticks?: unknown }>(url.toString());
  } catch (e) {
    if (e instanceof ApiClientError) {
      const reason = ORDERBOOK_TICKS_UNAVAILABLE_STATUSES[e.status];
      if (reason) return { status: "unavailable", reason };
    }
    throw e;
  }

  // A 200 without a ticks array, or with any entry that is not a valid tick,
  // is not the documented empty book. Malformed entries would otherwise be
  // dropped by the depth filters and render as an empty book, so the whole
  // response is treated as malformed.
  if (!Array.isArray(data?.ticks) || !data.ticks.every(isValidSQSTick)) {
    return { status: "unavailable", reason: "malformed" };
  }

  return { status: "ok", ticks: data.ticks };
}

const INTEGER_STRING = /^\d+$/;

function hasIntegerLiquidity(values: unknown): boolean {
  return (
    typeof values === "object" &&
    values !== null &&
    typeof (values as SQSOrderbookTickValues).total_amount_of_liquidity ===
      "string" &&
    INTEGER_STRING.test(
      (values as SQSOrderbookTickValues).total_amount_of_liquidity
    )
  );
}

function isValidSQSTick(tick: unknown): tick is SQSOrderbookTick {
  if (typeof tick !== "object" || tick === null) return false;
  const { tick_id, tick_state } = tick as Partial<SQSOrderbookTick>;
  return (
    Number.isSafeInteger(tick_id) &&
    typeof tick_state === "object" &&
    tick_state !== null &&
    hasIntegerLiquidity(tick_state.bid_values) &&
    hasIntegerLiquidity(tick_state.ask_values)
  );
}
