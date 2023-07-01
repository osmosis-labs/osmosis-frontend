import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { AccountDelegatedClPositionsResponse } from "./types";

export type StakedPositionInfo = {
  validatorAddress: string;
  lockId: string;
  equivalentStakedAmount: CoinPretty;
};

/** Superfluid staked positions per account. */
export class ObservableQueryAccountSuperfluidDelegatedClPositions extends ObservableChainQuery<AccountDelegatedClPositionsResponse> {
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
      `/osmosis/superfluid/v1beta1/account_delegated_cl_positions/${bech32Address}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.bech32Address !== "";
  }

  @computed
  get stakedPositionIds(): string[] {
    return (
      this.response?.data.cl_pool_user_position_records.map(
        ({ position_id }) => position_id
      ) ?? []
    );
  }

  @computed
  get stakedPositions(): (StakedPositionInfo & {
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
      })) ?? []
    );
  }

  /** Gets info about a staked position given position ID. */
  readonly getStakedPositionInfo = computedFn(
    (
      params: { positionId: string } | { lockId: string }
    ): StakedPositionInfo | undefined => {
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
      };
    }
  );
}

/** Get superfluid delegated positions per account. */
export class ObservableQueryAccountsSuperfluidDelegatedClPositions extends ObservableChainQueryMap<AccountDelegatedClPositionsResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (bech32Address) => {
      return new ObservableQueryAccountSuperfluidDelegatedClPositions(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  get(
    bech32Address: string
  ): ObservableQueryAccountSuperfluidDelegatedClPositions {
    return super.get(
      bech32Address
    ) as ObservableQueryAccountSuperfluidDelegatedClPositions;
  }
}
