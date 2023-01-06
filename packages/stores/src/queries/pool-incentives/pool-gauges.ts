import { computed, makeObservable } from "mobx";
import {
  ChainGetter,
  ObservableChainQuery,
  HasMapStore,
} from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { Duration } from "dayjs/plugin/duration";
import dayjs from "dayjs";
import { GaugeIdsWithDuration } from "./types";

/** Queries matching gauge ids and durations in seconds for a given pool. */
export class ObservableQueryPoolGaugeIds extends ObservableChainQuery<GaugeIdsWithDuration> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    poolId: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/pool-incentives/v1beta1/gauge-ids/${poolId}`
    );

    makeObservable(this);
  }

  @computed
  get gaugeIdsWithDuration():
    | {
        gaugeId: string;
        duration: Duration;
      }[]
    | undefined {
    return this.response?.data.gauge_ids_with_duration.map(
      ({ gauge_id, duration }) => {
        const seconds = parseInt(duration.slice(0, -1));

        return {
          gaugeId: gauge_id,
          duration: !isNaN(seconds)
            ? dayjs.duration({ seconds })
            : dayjs.duration(0),
        };
      }
    );
  }
}

export class ObservableQueryPoolsGaugeIds extends HasMapStore<ObservableQueryPoolGaugeIds> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      (poolId) =>
        new ObservableQueryPoolGaugeIds(kvStore, chainId, chainGetter, poolId)
    );
  }

  get(poolId: string): ObservableQueryPoolGaugeIds {
    return super.get(poolId);
  }
}
