import { KVStore } from "@keplr-wallet/common";
import { CoinPretty } from "@keplr-wallet/unit";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@osmosis-labs/keplr-stores";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { AccountUndelegatingClPositionsResponse } from "./types";

export type UndelegatingPositionInfo = {
  validatorAddress: string;
  lockId: string;
  equivalentStakedAmount: CoinPretty;
  endTime: Date;
};

/** Superfluid undelegating positions per account. */
export class ObservableQueryAccountSuperfluidUndelegatingClPositions extends ObservableChainQuery<AccountUndelegatingClPositionsResponse> {
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
      `/osmosis/superfluid/v1beta1/account_undelegating_cl_positions/${bech32Address}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.bech32Address !== "";
  }

  @computed
  get undelegatingPositionIds(): string[] {
    return (
      this.response?.data.cl_pool_user_position_records.map(
        ({ position_id }) => position_id
      ) ?? []
    );
  }

  @computed
  get undelegatingPositions(): (UndelegatingPositionInfo & {
    positionId: string;
  })[] {
    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    return (
      this.response?.data.cl_pool_user_position_records.map((record) => ({
        positionId: record.position_id,
        validatorAddress: record.validator_address,
        lockId: record.lock_id,
        equivalentStakedAmount: new CoinPretty(
          stakeCurrency,
          record.equivalent_staked_amount.amount
        ),
        endTime: new Date(record.synthetic_lock.end_time),
      })) ?? []
    );
  }

  /** Gets info about a staked position given position ID. */
  readonly getUndelegatingPositionInfo = computedFn(
    (
      params: { positionId: string } | { lockId: string }
    ): UndelegatingPositionInfo | undefined => {
      const rawRecord = this.response?.data.cl_pool_user_position_records.find(
        ({ position_id }) =>
          ("positionId" in params && position_id === params.positionId) ||
          ("lockId" in params && position_id === params.lockId)
      );
      if (!rawRecord) return;

      const stakeCurrency = this.chainGetter.getChain(
        this.chainId
      ).stakeCurrency;

      return {
        validatorAddress: rawRecord.validator_address,
        lockId: rawRecord.lock_id,
        equivalentStakedAmount: new CoinPretty(
          stakeCurrency,
          rawRecord.equivalent_staked_amount.amount
        ),
        endTime: new Date(rawRecord.synthetic_lock.end_time),
      };
    }
  );
}

/** Get superfluid undelegating positions per account. */
export class ObservableQueryAccountsSuperfluidUndelegatingClPositions extends ObservableChainQueryMap<AccountUndelegatingClPositionsResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (bech32Address) => {
      return new ObservableQueryAccountSuperfluidUndelegatingClPositions(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  get(
    bech32Address: string
  ): ObservableQueryAccountSuperfluidUndelegatingClPositions {
    return super.get(
      bech32Address
    ) as ObservableQueryAccountSuperfluidUndelegatingClPositions;
  }
}
