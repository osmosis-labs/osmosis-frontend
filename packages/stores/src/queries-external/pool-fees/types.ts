import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "../../queries/pools";

export interface ObservablePoolWithFeeMetrics extends PoolFeesMetrics {
  pool: ObservableQueryPool;
  liquidity: PricePretty;
  myLiquidity?: PricePretty;
  epochsRemaining?: number;
  apr?: RatePretty;
}

export interface PoolFeesMetrics {
  volume24h: PricePretty;
  volume7d: PricePretty;
  feesSpent24h: PricePretty;
  feesSpent7d: PricePretty;
  feesPercentage: string;
}

export interface PoolFees {
  last_update_at: number;
  data: {
    pool_id: string;
    volume_24h: number;
    volume_7d: number;
    fees_spent_24h: number;
    fees_spent_7d: number;
    fees_percentage: string;
  }[];
}
