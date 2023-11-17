export interface TokenMarketCap {
  /**
   * Coin denom in upper case.
   * E.g. "ATOM", "LUNC", "CRO"
   */
  symbol: string;
  market_cap: number;
}
