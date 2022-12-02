import { PricePretty } from "@keplr-wallet/unit";

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

export type ChartPrice = PricePretty;
