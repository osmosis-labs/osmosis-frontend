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
  liqudity: string;
  volume24h: string;
  fees7d: string;
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

  readonly getPoolsWithMetric = computedFn(
    (
      allPools: ObservablePool[],
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

      return allPools.map((pool) => {
        const poolMetric = this.response?.data.data.find(
          (poolMetric) => poolMetric.pool_id === pool.id
        );

        const liqudity = pool
          .computeTotalValueLocked(priceStore, fiatCurrency)
          .toString();

        const volume24h = poolMetric?.volume_24h
          ? new PricePretty(
              fiatCurrency,
              new Dec(poolMetric.volume_24h.toFixed(10))
            ).toString()
          : "...";
        const fees7d = poolMetric?.fees_spent_7d
          ? new PricePretty(
              fiatCurrency,
              new Dec(poolMetric.fees_spent_7d.toFixed(10))
            ).toString()
          : "...";

        return {
          pool,
          liqudity,
          volume24h,
          fees7d,
        };
      });
    }
  );
}
