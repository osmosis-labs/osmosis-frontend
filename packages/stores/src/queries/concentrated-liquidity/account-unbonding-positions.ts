import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { makeObservable } from "mobx";

import { PeriodLock } from "../lockup/types";
import { LiquidityPosition } from "./types";

const URL_BASE = "/osmosis/concentratedliquidity/v1beta1";

type PositionWithPeriodLock = {
  position: LiquidityPosition;
  locks: PeriodLock;
};

export class ObservableQueryAccountUnbondingPositions extends ObservableChainQuery<{
  positions_with_period_lock: PositionWithPeriodLock[];
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `${URL_BASE}/user_unbonding_positions/${bech32Address}`
    );

    makeObservable(this);
  }

  protected canFetch() {
    return Boolean(this.bech32Address);
  }
}

export class ObservableQueryAccountsUnbondingPositions extends ObservableChainQueryMap<{
  positions_with_period_lock: PositionWithPeriodLock[];
}> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryAccountUnbondingPositions(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  get(bech32Address: string) {
    return super.get(bech32Address) as ObservableQueryAccountUnbondingPositions;
  }
}
