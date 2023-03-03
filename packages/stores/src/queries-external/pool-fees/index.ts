import { KVStore } from "@keplr-wallet/common";
import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../../price";
import { ObservableQueryPool } from "../../queries/pools";
import { ObservableQueryExternalBase } from "../base";
import { PoolFees, PoolFeesMetrics } from "./types";

/** Queries Imperator pool fee history data. */
export class ObservableQueryPoolFeesMetrics extends ObservableQueryExternalBase<PoolFees> {
  constructor(kvStore: KVStore, baseURL: string) {
    super(kvStore, baseURL, "/fees/v1/pools");

    makeObservable(this);
  }

  readonly getPoolFeesMetrics = computedFn(
    (poolId: string, priceStore: IPriceStore): PoolFeesMetrics => {
      const fiatCurrency = priceStore.getFiatCurrency(
        priceStore.defaultVsCurrency
      );
      if (!fiatCurrency) {
        throw new Error("There is no fiat currency in priceStore");
      }

      const zeroPrice = new PricePretty(fiatCurrency, new Dec(0)).ready(false);
      const zeroMetrics = {
        volume24h: zeroPrice,
        volume7d: zeroPrice,
        feesSpent24h: zeroPrice,
        feesSpent7d: zeroPrice,
        feesPercentage: "",
      };

      try {
        const poolFeesMetricsRaw = this.response?.data.data.find(
          (poolMetric) => poolMetric.pool_id === poolId
        );
        if (!poolFeesMetricsRaw) {
          return zeroMetrics;
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
      } catch {
        return zeroMetrics;
      }
    }
  );

  /** Get pool non-incentivized return from fees based on past 7d of activity. */
  readonly get7dPoolFeeApr = computedFn(
    (pool: ObservableQueryPool, priceStore: IPriceStore): RatePretty => {
      const { feesSpent7d } = this.getPoolFeesMetrics(pool.id, priceStore);
      const avgDayFeeRevenue = new Dec(feesSpent7d.toDec().toString(), 6).quo(
        new Dec(7)
      );
      const poolTVL = pool.computeTotalValueLocked(priceStore).toDec();
      const revenuePerYear = avgDayFeeRevenue.mul(new Dec(365));

      if (poolTVL.equals(new Dec(0)) || revenuePerYear.equals(new Dec(0)))
        return new RatePretty(0);

      return new RatePretty(revenuePerYear.quo(poolTVL));
    }
  );
}

export * from "./types";
