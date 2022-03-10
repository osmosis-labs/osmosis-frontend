import { KVStore } from "@keplr-wallet/common";
import { CoinGeckoPriceStore, ObservableQuery } from "@keplr-wallet/stores";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { ObservablePool } from "../queries/pools";
import Axios from "axios";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

const IMPERATOR_API_DOMAIN = "https://api-osmosis.imperator.co";

export interface ObservablePoolWithFeeMetrics {
  pool: ObservablePool;
  liquidity: PricePretty;
  volume24h: PricePretty;
  fees7d: PricePretty;
  myLiquidity?: PricePretty;
  epochsRemaining?: number;
  apr?: string;
}

export class ObservableExternalQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, urlPath: string) {
    const instance = Axios.create({ baseURL: IMPERATOR_API_DOMAIN });

    super(kvStore, instance, urlPath);
  }
}

export class ObservableQueryPoolsFeeMetrics extends ObservableExternalQuery<{
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
