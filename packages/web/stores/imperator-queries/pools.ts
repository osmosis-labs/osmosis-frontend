import { KVStore } from "@keplr-wallet/common";
import {
  ObservableQuery,
  QueryOptions,
  QueryResponse,
} from "@keplr-wallet/stores";
import Axios, { AxiosInstance, CancelToken } from "axios";
import { makeObservable, observable, action, computed } from "mobx";
import { computedFn } from "mobx-utils";
import { PricePretty, CoinPretty, Dec } from "@keplr-wallet/unit";

import { ObservablePool } from "@osmosis-labs/stores";

import { IMPERATOR_API_DOMAIN } from "../../constants";
import { FiatCurrency } from "@keplr-wallet/types";

interface PoolMetric {
  pool_id: string;
  volume_24h: number;
  volume_7d: number;
  fees_spent_24h: number;
  fees_spent_7d: number;
  fees_percentage: number;
}

interface ObservablePoolWithMetric {
  pool: ObservablePool;
  liquidity: PricePretty;
  volume24h: PricePretty;
  fees7d: PricePretty;
}

export class ObservableImperatorQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  constructor(kvStore: KVStore, urlPath: string) {
    const instance = Axios.create({ baseURL: IMPERATOR_API_DOMAIN });

    super(kvStore, instance, urlPath);
  }
}

export class ObservableImperatorQueryPoolMetrics extends ObservableImperatorQuery<{
  last_update_at: number;
  data: PoolMetric[];
}> {
  constructor(kvStore: KVStore) {
    super(kvStore, "/fees/v1/pools");

    makeObservable(this);
  }

  readonly makePoolsWithMetric = computedFn(
    (
      pools: ObservablePool[],
      priceStore: {
        calculatePrice(
          coin: CoinPretty,
          vsCurrrency?: string
        ): PricePretty | undefined;
      },
      fiatCurrency: FiatCurrency
    ): ObservablePoolWithMetric[] => {
      if (!this.response) {
        return [];
      }

      return pools.map((pool) => {
        const poolMetric = this.response?.data.data.find(
          (poolMetric) => poolMetric.pool_id === pool.id
        );

        const liquidity = pool.computeTotalValueLocked(
          priceStore,
          fiatCurrency
        );

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
      });
    }
  );
}
