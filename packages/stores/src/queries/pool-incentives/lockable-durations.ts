import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { computed, makeObservable } from "mobx";

import { LockableDurations } from "./types";

export class ObservableQueryLockableDurations extends ObservableChainQuery<LockableDurations> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/pool-incentives/v1beta1/lockable_durations"
    );

    makeObservable(this);
  }

  /** On chain param: bond durations capable of receiving internal (OSMO) mint incentives, assuming pool is marked incentivized. */
  @computed
  get lockableDurations(): Duration[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.lockable_durations
      .map((durationStr: string) => {
        // Golang의 duration은 언제나 초 단위로 온다.
        // XXX: commonjs일때 밑의 라인이 오류가 발생해서 test:rand-pools 스크립트가 실행이 안됨...
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return dayjs.duration(parseInt(durationStr.replace("s", "")) * 1000);
      })
      .slice()
      .sort((v1, v2) => {
        // 오름차순 정렬
        return v1.asMilliseconds() > v2.asMilliseconds() ? 1 : -1;
      });
  }

  @computed
  get highestDuration(): Duration | undefined {
    if (!this.response || this.response.data.lockable_durations.length === 0)
      return;

    return this.lockableDurations[this.lockableDurations.length - 1];
  }
}
