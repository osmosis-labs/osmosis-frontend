import { apiClient } from "@osmosis-labs/utils";

import { NUMIA_BASE_URL } from "../../env";

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
}

export function queryHistoricalOrders(
  userOsmoAddress: string
): Promise<HistoricalLimitOrder[]> {
  const url = new URL(
    `/users/limit_orders/history/closed?address=${userOsmoAddress}`,
    NUMIA_BASE_URL
  );
  return apiClient<HistoricalLimitOrder[]>(url.toString());
}
