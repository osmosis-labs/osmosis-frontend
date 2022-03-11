import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservablePool } from "../../queries/pools";

export interface ObservablePoolWithFeeMetrics {
  pool: ObservablePool;
  liquidity: PricePretty;
  volume24h: PricePretty;
  fees7d: PricePretty;
  myLiquidity?: PricePretty;
  epochsRemaining?: number;
  apr?: RatePretty;
}
