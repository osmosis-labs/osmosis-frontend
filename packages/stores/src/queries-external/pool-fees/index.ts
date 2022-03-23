import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { KVStore } from "@keplr-wallet/common";
import { CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { Dec, PricePretty } from "@keplr-wallet/unit";

import { ObservablePool } from "../../queries/pools";
import { ObservableQueryExternal } from "../store";
import { ObservablePoolWithFeeMetrics, PoolFeesMetrics } from "./types";

export class ObservableQueryPoolFeesMetrics extends ObservableQueryExternal<{
  last_update_at: number;
  data: {
    pool_id: string;
    volume_24h: number;
    volume_7d: number;
    fees_spent_24h: number;
    fees_spent_7d: number;
    fees_percentage: string;
  }[];
}> {
  constructor(kvStore: KVStore) {
    super(kvStore, "/fees/v1/pools");

    makeObservable(this);
  }

  readonly makePoolWithFeeMetrics = computedFn(
    (
      pool: ObservablePool,
      priceStore: CoinGeckoPriceStore
    ): ObservablePoolWithFeeMetrics => {
      const poolFeesMetrics = this.getPoolFeesMetrics(pool.id, priceStore);
      const liquidity = pool.computeTotalValueLocked(priceStore);

      return {
        pool,
        liquidity,
        ...poolFeesMetrics,
      };
    }
  );

  readonly getPoolFeesMetrics = computedFn(
    (poolId: string, priceStore: CoinGeckoPriceStore): PoolFeesMetrics => {
      const fiatCurrency = priceStore.getFiatCurrency(
        priceStore.defaultVsCurrency
      );
      if (!fiatCurrency) {
        throw new Error("There is no fiat currency in priceStore");
      }

      const poolFeesMetricsRaw = this.response?.data.data.find(
        (poolMetric) => poolMetric.pool_id === poolId
      );
      if (!poolFeesMetricsRaw) {
        const zeroPrice = new PricePretty(fiatCurrency, new Dec(0));
        return {
          volume24h: zeroPrice,
          volume7d: zeroPrice,
          feesSpent24h: zeroPrice,
          feesSpent7d: zeroPrice,
          feesPercentage: "",
        };
      }

      const volume24h = new PricePretty(
        fiatCurrency,
        new Dec(poolFeesMetricsRaw.volume_24h)
      );
      const volume7d = new PricePretty(
        fiatCurrency,
        new Dec(poolFeesMetricsRaw.volume_7d)
      );
      const feesSpent24h = new PricePretty(
        fiatCurrency,
        new Dec(poolFeesMetricsRaw.fees_spent_24h)
      );
      const feesSpent7d = new PricePretty(
        fiatCurrency,
        new Dec(poolFeesMetricsRaw.fees_spent_7d)
      );
      const feesPercentage = poolFeesMetricsRaw.fees_percentage;

      return {
        volume24h,
        volume7d,
        feesSpent24h,
        feesSpent7d,
        feesPercentage,
      };
    }
  );
}

export * from "./types";
