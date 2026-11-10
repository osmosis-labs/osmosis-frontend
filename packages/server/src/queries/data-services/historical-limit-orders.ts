import { apiClient } from "@osmosis-labs/utils";

import { HISTORICAL_DATA_URL } from "../../env";

export interface HistoricalLimitOrder {
  place_timestamp: string;
  place_tx_hash: string;
  order_denom: string;
  output_denom: string;
  quantity: string;
  tick_id: string;
  order_id: string;
  order_direction: "ask" | "bid";
  price: string;
  status: string;
  contract: string;
  claimed_quantity: string;
  cancel_tx_hash: string | null;
  cancel_timestamp: string | null;
  /** One entry per payout, oldest first. Null means Numia has no payout data for the order, not that nothing was paid. */
  claims: { tx_hash: string; timestamp: string; amount: string }[] | null;
}

export function queryHistoricalOrders(
  userOsmoAddress: string
): Promise<HistoricalLimitOrder[]> {
  const url = new URL(
    `/users/limit_orders/history/closed?address=${userOsmoAddress}`,
    HISTORICAL_DATA_URL
  );
  return apiClient<HistoricalLimitOrder[]>(url.toString());
}
