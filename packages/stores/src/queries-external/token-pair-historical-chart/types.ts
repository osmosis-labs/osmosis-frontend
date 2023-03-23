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

export type PriceRange = "7d" | "1mo" | "1y";
