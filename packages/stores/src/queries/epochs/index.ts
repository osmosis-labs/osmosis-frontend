import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { computed, observable } from "mobx";

import { Epochs } from "./types";

export class ObservableQueryEpochsInner {
  constructor(
    protected readonly identifier: string,
    protected readonly queryEpochs: ObservableQueryEpochs
  ) {}

  @computed
  get epoch(): Epochs["epochs"][0] | undefined {
    return this.queryEpochs.response?.data.epochs.find(
      (epoch) => epoch.identifier === this.identifier
    );
  }

  @computed
  get duration(): Duration | undefined {
    if (!this.epoch) {
      return;
    }

    // Golang Protobuf's duration is returned in seconds only.
    return dayjs.duration(
      parseInt(this.epoch.duration.replace("s", "")) * 1000
    );
  }

  @computed
  get startTime(): Date {
    if (!this.epoch) {
      return new Date(0);
    }

    return new Date(this.epoch.current_epoch_start_time);
  }

  @computed
  get endTime(): Date {
    const startTime = this.startTime;
    if (!this.duration) {
      return startTime;
    }

    return dayjs(startTime).add(this.duration).toDate();
  }
}

export class ObservableQueryEpochs extends ObservableChainQuery<Epochs> {
  @observable.shallow
  protected map: Map<string, ObservableQueryEpochsInner> = new Map();

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/osmosis/epochs/v1beta1/epochs");
  }

  getEpoch(identifier: string) {
    if (!this.map.has(identifier)) {
      const inner = new ObservableQueryEpochsInner(identifier, this);
      this.map.set(identifier, inner);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.map.get(identifier)!;
  }
}

export * from "./types";
