import { apiClient } from "@osmosis-labs/utils";

import { TIMESERIES_DATA_URL } from "../../env";

/**
 * Time frame represents the amount of minutes per bar, basically price every
 * `tf` minutes. E.g. 5 - Price every 5 minutes, 1440 - price every day, etc.
 *
 * For example, if you want to get the 1 day chart, you should set `tf` to 1440.
 * This will return 365 bars of data for each year. Each year has 525600 minutes,
 * so 525600 / 1440 = 365 bars.
 *
 * 5     - 5 minutes
 * 15    - 15 minutes
 * 30    - 30 minutes
 * 60    - 1 hour also known as '1H' in chart
 * 120   - 2 hours
 * 240   - 4 hours
 * 720   - 12 hours
 * 1440  - 1 day also known as '1D' in chart
 * 10080 - 1 week also known as '1W' in chart
 * 43800 - 1 month also known as '30D' in chart
 */
export const AvailableRangeValues = [
  5, 15, 30, 60, 120, 240, 720, 1440, 10080, 43800,
] as const;
export type TimeFrame = (typeof AvailableRangeValues)[number];

export interface TokenHistoricalPrice {
  close: number;
  high: number;
  low: number;
  open: number;
  /**
   * Unix timestamp in seconds
   */
  time: number;
  volume: number;
}

export async function queryTokenHistoricalChart({
  coinDenom,
  timeFrameMinutes,
}: {
  /** Major (symbol) denom to fetch historical price data for. */
  coinDenom: string;
  /** Number of minutes per bar. So 60 refers to price every 60 minutes. */
  timeFrameMinutes: TimeFrame;
}): Promise<TokenHistoricalPrice[]> {
  // collect params
  const url = new URL(
    `/tokens/v2/historical/${coinDenom}/chart?tf=${timeFrameMinutes}`,
    TIMESERIES_DATA_URL
  );
  try {
    const response = await apiClient<
      TokenHistoricalPrice[] | { message: string }
    >(url.toString());

    if ("message" in response) {
      if (response.message.includes("symbol not Found")) return [];
    } else if (!Array.isArray(response)) {
      throw new Error("Unexpected response");
    }

    return response as TokenHistoricalPrice[];
  } catch (e) {
    throw new Error(
      `Unexpected error while fetching historical price for token ${coinDenom}: ${e}`
    );
  }
}
