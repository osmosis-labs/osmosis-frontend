import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  QueryResponse,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { action, computed, makeObservable, observable } from "mobx";

import { Gauge, GaugeById } from "./types";

/** Individual gauge that can be fetched individually, as well as initialized with data statically (and later refreshed). */
export class ObservableQueryGauge extends ObservableChainQuery<GaugeById> {
  @observable.ref
  protected _raw?: Gauge;

  protected _canFetch = false;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    id: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/incentives/v1beta1/gauge_by_id/${id}`
    );

    makeObservable(this);
  }

  static makeWithRaw(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    gauge: Gauge
  ) {
    const queryGauge = new ObservableQueryGauge(
      kvStore,
      chainId,
      chainGetter,
      gauge.id
    );
    queryGauge.setRaw(gauge);
    return queryGauge;
  }

  allowFetch() {
    this._canFetch = true;
  }

  protected canFetch() {
    return !this._raw && this._canFetch;
  }

  @action
  setRaw(gauge: Gauge) {
    this._raw = gauge;
  }

  get hasData() {
    return this._raw !== undefined;
  }

  // manage the response ourselves, outside of the base store
  protected setResponse(response: Readonly<QueryResponse<GaugeById>>) {
    super.setResponse(response);

    for (const coin of response.data.gauge.coins) {
      this.chainGetter.getChain(this.chainId).addUnknownCurrencies(coin.denom);
    }

    this.setRaw(response.data.gauge);
  }

  get gauge() {
    return this._raw;
  }

  @computed
  get startTime(): Date {
    if (!this._raw) {
      return new Date(0);
    }

    return new Date(this._raw.start_time);
  }

  @computed
  get lockupDuration(): Duration {
    if (!this._raw) {
      return dayjs.duration({
        seconds: 0,
      });
    }

    if (this._raw.distribute_to.lock_query_type !== "ByDuration") {
      return dayjs.duration({
        seconds: 0,
      });
    }

    return dayjs.duration({
      seconds: parseInt(this._raw.distribute_to.duration.replace("s", "")),
    });
  }

  @computed
  get remainingEpoch(): number {
    if (!this._raw) {
      return 0;
    }

    return (
      parseInt(this._raw.num_epochs_paid_over) -
      parseInt(this._raw.filled_epochs)
    );
  }

  @computed
  get numEpochsPaidOver(): number {
    if (!this._raw) {
      return 0;
    }

    return parseInt(this._raw.num_epochs_paid_over);
  }

  @computed
  get coins(): { distributed: CoinPretty; remaining: CoinPretty }[] {
    const gauge = this._raw;
    if (!gauge) {
      return [];
    }

    return gauge.coins.map((coin, index) => {
      const currency = this.chainGetter
        .getChain(this.chainId)
        .forceFindCurrency(coin.denom);
      const distributed = new CoinPretty(
        currency,
        new Dec(gauge.distributed_coins[index]?.amount ?? "0")
      );
      return {
        distributed,
        remaining: new CoinPretty(currency, new Dec(coin.amount)).sub(
          distributed
        ),
      };
    });
  }
}

export class ObservableQueryGauges extends ObservableChainQueryMap<GaugeById> {
  protected _fetchingGaugeIds: Set<string> = new Set();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (id: string) => {
      return new ObservableQueryGauge(kvStore, chainId, chainGetter, id);
    });
  }

  get(id: string): ObservableQueryGauge {
    const gauge = super.get(id) as ObservableQueryGauge;

    // If the requested gauge does not have data, fetch it.
    if (!gauge.hasData && !this._fetchingGaugeIds.has(id)) {
      this._fetchingGaugeIds.add(id);
      gauge.allowFetch();
      gauge.waitResponse().finally(() => this._fetchingGaugeIds.delete(id));
    }

    return gauge;
  }

  /** Adds a gauge to the map store with prepopulated data. */
  @action
  setWithGauge(gauge: Gauge) {
    const queryGauge = ObservableQueryGauge.makeWithRaw(
      this.kvStore,
      this.chainId,
      this.chainGetter,
      gauge
    );
    this.map.set(gauge.id, queryGauge);
  }
}
