import { apiClient } from "@osmosis-labs/utils";

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
  quantity: number;
  etas: string;
  placed_quantity: number;
  placed_at: number;
  price: string;
  percentClaimed: string;
  totalFilled: number;
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
    `/orderbook/active-orders?userOsmoAddress=${userOsmoAddress}`,
    SIDECAR_BASE_URL
  );
  return await apiClient<ActiveOrdersResponse>(url.toString());
}
