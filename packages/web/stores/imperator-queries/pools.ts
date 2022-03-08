import { KVStore } from "@keplr-wallet/common";
import { ObservableQuery } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ObservablePool } from "@osmosis-labs/stores";
import Axios from "axios";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { IMPERATOR_API_DOMAIN } from "../../constants";

export interface ObservablePoolWithFeeMetrics {
  pool: ObservablePool;
  liquidity: PricePretty;
  volume24h: PricePretty;
  fees7d: PricePretty;
  myLiquidity?: PricePretty;
  epochsRemaining?: number;
  apr?: string;
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

export class ObservableQueryPoolsFeeMetrics extends ObservableImperatorQuery<{
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
      priceStore: {
        calculatePrice(
          coin: CoinPretty,
          vsCurrrency?: string
        ): PricePretty | undefined;
      },
      fiatCurrency: FiatCurrency
    ): ObservablePoolWithFeeMetrics => {
      const poolMetric = this.response?.data.data.find(
        (poolMetric) => poolMetric.pool_id === pool.id
      );

      const liquidity = pool.computeTotalValueLocked(priceStore, fiatCurrency);
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
