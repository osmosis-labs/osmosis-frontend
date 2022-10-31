import { PricePretty } from "@keplr-wallet/unit";

export interface PoolsRewards {
  pools: {
    [id: string]: {
      day_usd: number;
      month_usd: number;
      year_usd: number;
    };
  };
  total_day_usd: number;
  total_month_usd: number;
  total_year_usd: number;
}

export interface PoolRewards {
  day: PricePretty;
  month: PricePretty;
  year: PricePretty;
}
