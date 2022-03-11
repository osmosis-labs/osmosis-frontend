import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { KVStore } from "@keplr-wallet/common";
import { CoinGeckoPriceStore } from "@keplr-wallet/stores";
import { Dec, PricePretty } from "@keplr-wallet/unit";

import { ObservablePool } from "../../queries/pools";
import { ObservableQueryExternal } from "../store";
import { ObservablePoolWithFeeMetrics } from "./types";

export class ObservableQueryPoolFeesMetrics extends ObservableQueryExternal<{
  last_update_at: number;
  data: {
    pool_id: string;
    volume_24h: number;
    volume_7d: number;
    fees_spent_24h: number;
    fees_spent_7d: number;
    fees_percentage: number;
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
      const poolMetric = this.response?.data.data.find(
        (poolMetric) => poolMetric.pool_id === pool.id
      );

      const fiatCurrency = priceStore.getFiatCurrency(
        priceStore.defaultVsCurrency
      )!;

      const liquidity = pool.computeTotalValueLocked(priceStore);
      const volume24h = new PricePretty(
        fiatCurrency,
        poolMetric?.volume_24h
          ? new Dec(poolMetric.volume_24h.toFixed(10))
          : new Dec(0)
      );
      const fees7d = new PricePretty(
        fiatCurrency,
        poolMetric?.fees_spent_7d
          ? new Dec(poolMetric.fees_spent_7d.toFixed(10))
          : new Dec(0)
      );

      return {
        pool,
        liquidity,
        volume24h,
        fees7d,
      };
    }
  );
}
