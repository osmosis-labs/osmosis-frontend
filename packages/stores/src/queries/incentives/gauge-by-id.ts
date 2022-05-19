import {
  ObservableChainQueryMap,
  ChainGetter,
  ObservableChainQuery,
  QueryResponse,
} from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { GaugeById } from "./types";
import { computed } from "mobx";
import { computedFn } from "mobx-utils";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";
import dayjs from "dayjs";

export class ObservableQueryGuageById extends ObservableChainQuery<GaugeById> {
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
  }

  protected setResponse(response: Readonly<QueryResponse<GaugeById>>) {
    super.setResponse(response);

    for (const coin of response.data.gauge.coins) {
      this.chainGetter.getChain(this.chainId).findCurrency(coin.denom);
    }
  }

  @computed
  get startTime(): Date {
    if (!this.response) {
      return new Date(0);
    }

    return new Date(this.response.data.gauge.start_time);
  }

  @computed
  get lockupDuration(): Duration {
    if (!this.response) {
      return dayjs.duration({
        seconds: 0,
      });
    }

    if (
      this.response.data.gauge.distribute_to.lock_query_type !== "ByDuration"
    ) {
      return dayjs.duration({
        seconds: 0,
      });
    }

    return dayjs.duration({
      seconds: parseInt(
        this.response.data.gauge.distribute_to.duration.replace("s", "")
      ),
    });
  }

  @computed
  get remainingEpoch(): number {
    if (!this.response) {
      return 0;
    }

    return (
      parseInt(this.response.data.gauge.num_epochs_paid_over) -
      parseInt(this.response.data.gauge.filled_epochs)
    );
  }

  @computed
  get numEpochsPaidOver(): number {
    if (!this.response) {
      return 0;
    }

    return parseInt(this.response.data.gauge.num_epochs_paid_over);
  }

  readonly getCoin = computedFn((currency: AppCurrency): CoinPretty => {
    if (!this.response) {
      return new CoinPretty(currency, new Dec(0));
    }

    const primitive = this.response.data.gauge.coins.find(
      (coin) => coin.denom === currency.coinMinimalDenom
    );
    if (!primitive) {
      return new CoinPretty(currency, new Dec(0));
    }
    return new CoinPretty(currency, new Dec(primitive.amount));
  });

  readonly getDistributedCoin = computedFn(
    (currency: AppCurrency): CoinPretty => {
      if (!this.response) {
        return new CoinPretty(currency, new Dec(0));
      }

      const primitive = this.response.data.gauge.distributed_coins.find(
        (coin) => coin.denom === currency.coinMinimalDenom
      );
      if (!primitive) {
        return new CoinPretty(currency, new Dec(0));
      }
      return new CoinPretty(currency, new Dec(primitive.amount));
    }
  );

  readonly getRemainingCoin = computedFn(
    (currency: AppCurrency): CoinPretty => {
      return this.getCoin(currency).sub(this.getDistributedCoin(currency));
    }
  );
}

export class ObservableQueryGuage extends ObservableChainQueryMap<GaugeById> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (id: string) => {
      return new ObservableQueryGuageById(kvStore, chainId, chainGetter, id);
    });
  }

  get(id: string): ObservableQueryGuageById {
    return super.get(id) as ObservableQueryGuageById;
  }
}
