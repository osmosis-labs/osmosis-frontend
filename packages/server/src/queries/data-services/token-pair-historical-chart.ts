import { apiClient } from "@osmosis-labs/utils";

import { TIMESERIES_DATA_URL } from "../../env";

export interface TokenPairHistoricalPrice {
  close: number;
  high: number;
  low: number;
  open: number;
  /**
   * Unix timestamp in seconds
   */
  time: number;
}

export const AvailableTimeDurations = [
  "1h",
  "1d",
  "7d",
  "1mo",
  "1y",
  "all",
] as const;

export type TimeDuration = (typeof AvailableTimeDurations)[number];

export async function queryTokenPairHistoricalChart(
  poolId: string,
  quoteCoinMinimalDenom: string,
  baseCoinMinimalDenom: string,
  priceRange: TimeDuration
): Promise<TokenPairHistoricalPrice[]> {
  // collect params
  const url = new URL(
    `/pairs/v1/historical/${poolId}/chart?asset_in=${quoteCoinMinimalDenom}&asset_out=${baseCoinMinimalDenom}&range=${priceRange}&asset_type=denom`,
    TIMESERIES_DATA_URL
  );
  try {
    const response = await apiClient<
      TokenPairHistoricalPrice[] | { message: string }
    >(url.toString());

    if ("message" in response) {
      if (response.message.includes("symbol not Found")) return [];
      else throw new Error(response.message);
    } else if (!Array.isArray(response)) {
      throw new Error("Unexpected response");
    }

    return response as TokenPairHistoricalPrice[];
  } catch (e) {
    throw new Error(
      `Unexpected error while fetching historical token pair price for pool ${poolId}: ${e}`
    );
  }
}
