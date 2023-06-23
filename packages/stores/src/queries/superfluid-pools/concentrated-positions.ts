import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { UserSuperfluidPositionsPerConcentratedPoolBreakdownResponse } from "./types";

export type StakedPositionInfo = {
  validatorAddress: string;
  lockId: string;
  equivalentStakedAmount: CoinPretty;
};

export class ObservableQueryUserSuperfluidPositionsPerPool extends ObservableChainQuery<UserSuperfluidPositionsPerConcentratedPoolBreakdownResponse> {
  protected readonly delegatorBech32Address: string;
  protected readonly concentratedPoolId: string;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly key: string
  ) {
    const { delegatorBech32Address, concentratedPoolId } = parseKey(key);
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/superfluid/v1beta1/user_superfluid_positions_per_pool/${delegatorBech32Address}/${concentratedPoolId}`
    );

    this.delegatorBech32Address = delegatorBech32Address;
    this.concentratedPoolId = concentratedPoolId;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.delegatorBech32Address !== "" && this.concentratedPoolId !== "";
  }

  @computed
  get superfluidPositionIds(): string[] {
    return (
      this.response?.data.cl_pool_user_position_records.map(
        ({ position_id }) => position_id
      ) ?? []
    );
  }

  @computed
  get stakedPositionRecords(): (StakedPositionInfo & {
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

export class ObservableQueryUserSuperfluidPositionsPerPools extends ObservableChainQueryMap<UserSuperfluidPositionsPerConcentratedPoolBreakdownResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (key) => {
      return new ObservableQueryUserSuperfluidPositionsPerPool(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        key
      );
    });
  }

  getQueryUserPositionsPerPool(
    delegatorBech32Address: string,
    concentratedPoolId: string
  ): ObservableQueryUserSuperfluidPositionsPerPool {
    return this.get(
      makeKey(delegatorBech32Address, concentratedPoolId)
    ) as ObservableQueryUserSuperfluidPositionsPerPool;
  }
}

const delim = "/";

function makeKey(
  delegatorBech32Address: string,
  concentratedPoolId: string
): string {
  return `${delegatorBech32Address}${delim}${concentratedPoolId}`;
}

function parseKey(key: string): {
  delegatorBech32Address: string;
  concentratedPoolId: string;
} {
  const split = key.split(delim);
  return { delegatorBech32Address: split[0], concentratedPoolId: split[1] };
}
