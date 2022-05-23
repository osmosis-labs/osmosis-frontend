import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { KVStore } from "@keplr-wallet/common";
import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { pow } from "@osmosis-labs/math";
import { IPriceStore } from "../../price";
import { ObservableQueryPool } from "../../queries/pools";
import { ObservableQueryExternal } from "../store";
import {
  ObservablePoolWithFeeMetrics,
  PoolFeesMetrics,
  PoolFees,
} from "./types";

export class ObservableQueryPoolFeesMetrics extends ObservableQueryExternal<PoolFees> {
  constructor(kvStore: KVStore) {
    super(kvStore, "/fees/v1/pools");

    makeObservable(this);
  }

  readonly makePoolWithFeeMetrics = computedFn(
    (
      pool: ObservableQueryPool,
      priceStore: IPriceStore
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
    (poolId: string, priceStore: IPriceStore): PoolFeesMetrics => {
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

  /** Get pool non-incentivized return from fees based on past 7d of activity, compounded. */
  readonly get7dPoolFeeApy = computedFn(
    (
      pool: ObservablePoolWithFeeMetrics,
      priceStore: IPriceStore
    ): RatePretty => {
      const avgDayFeeRevenue = new Dec(
        pool.feesSpent7d.toDec().toString(),
        6
      ).quo(new Dec(7));
      const poolTVL = pool.pool.computeTotalValueLocked(priceStore).toDec();

      if (poolTVL.equals(new Dec(0))) {
        return new RatePretty(0);
      }
      const percentRevenue = avgDayFeeRevenue.quo(poolTVL);
      const dailyRate = new Dec(1).add(percentRevenue);
      const rate = pow(dailyRate, new Dec(365));

      return new RatePretty(rate)
        .sub(new Dec(1))
        .mul(new Dec(2))
        .moveDecimalPointLeft(2);
    }
  );
}

export * from "./types";
