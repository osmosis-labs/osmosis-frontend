import { apiClient } from "@osmosis-labs/utils";

import { authHeaders, DETAILS_API_URL } from "../coingecko";

export interface QueryMarketChartRequest {
  id: string;
  vsCurrency?: string;
  /**
   * Unix Timestamp
   */
  from: number;
  /**
   * Unix Timestamp
   */
  to: number;
}

export interface QueryMarketChartResponse {
  /**
   * [timestamp, price]
   */
  prices: number[][];
  /**
   * [timestamp, price]
   */
  market_caps: number[][];
  /**
   * [timestamp, price]
   */
  total_volumes: number[][];
}

export async function queryMarketChart(
  props: QueryMarketChartRequest
): Promise<QueryMarketChartResponse> {
  const { id, from, to, vsCurrency = "USD" } = props;

  const url = new URL(
    `/api/v3/coins/${id}/market_chart/range`,
    DETAILS_API_URL
  );

  url.searchParams.append("from", from.toString());
  url.searchParams.append("to", to.toString());
  url.searchParams.append("vs_currency", vsCurrency);

  return apiClient(url.toString(), {
    headers: authHeaders,
  });
}
