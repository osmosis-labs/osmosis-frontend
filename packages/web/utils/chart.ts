import { PricePretty } from "@keplr-wallet/unit";

/**
 * Get chart data.
 * @param prices - prices by hour
 */
export function getLastDayChartData(prices: PricePretty[] = []) {
  /**
   * We are querying the 1H chart which returns a bar for each hour.
   * So we need to subtract length by 24 to get current day's data.
   *  */
  const chunkedPrices = [...prices]
    .splice(prices.length - 24)
    .map((price) => Number(price.toDec().toString()));

  return chunkedPrices;
}
