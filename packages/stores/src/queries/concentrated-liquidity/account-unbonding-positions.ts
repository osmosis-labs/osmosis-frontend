import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { PeriodLock } from "../lockup/types";
import { ObservableQueryLiquidityPositionsById } from "./position-by-id";
import { LiquidityPosition } from "./types";

const URL_BASE = "/osmosis/concentratedliquidity/v1beta1";

type PositionWithPeriodLock = {
  position: LiquidityPosition["position"];
  locks: PeriodLock;
};

export class ObservableQueryAccountUnbondingPositions extends ObservableChainQuery<{
  positions_with_period_lock: PositionWithPeriodLock[];
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly queryPositionsById: ObservableQueryLiquidityPositionsById,
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

  @computed
  get positionUnbondingInfos() {
    return (
      this.response?.data.positions_with_period_lock
        .map(({ position: { position_id } }) => {
          return this.getPositionUnbondingInfo(position_id);
        })
        .filter(
          (
            info
          ): info is NonNullable<
            ReturnType<typeof this.getPositionUnbondingInfo>
          > => Boolean(info)
        ) ?? []
    );
  }

  readonly getPositionUnbondingInfo = computedFn((positionId: string) => {
    const rawPosition = this.response?.data.positions_with_period_lock.find(
      (positionWithLock) => positionWithLock.position.position_id === positionId
    );

    if (!rawPosition) return;

    return {
      position: this.queryPositionsById.getForPositionId(positionId),
      endTime: new Date(rawPosition.locks.end_time),
      lockId: rawPosition.locks.ID,
    };
  });
}

export class ObservableQueryAccountsUnbondingPositions extends ObservableChainQueryMap<{
  positions_with_period_lock: PositionWithPeriodLock[];
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly queryPositionsById: ObservableQueryLiquidityPositionsById
  ) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryAccountUnbondingPositions(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        queryPositionsById,
        bech32Address
      );
    });
  }

  get(bech32Address: string) {
    return super.get(bech32Address) as ObservableQueryAccountUnbondingPositions;
  }
}
