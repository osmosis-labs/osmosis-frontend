import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import {
  SuperfluidUndelegation,
  SuperfluidUndelegationsResponse,
} from "./types";

export class ObservableQuerySuperfluidUndelegationsInner extends ObservableChainQuery<SuperfluidUndelegationsResponse> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly delegatorBech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/superfluid/v1beta1/superfluid_undelegations_by_delegator/${delegatorBech32Address}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.delegatorBech32Address !== "";
  }

  readonly getUndelegations = computedFn(
    (poolShareCurrency: Currency): SuperfluidUndelegation[] | undefined => {
      if (!this.response) {
        return undefined;
      }

      const superfluidUndelegationRecords =
        this.response.data.superfluid_delegation_records;
      const superfluidUndelegationLocks = this.response.data.synthetic_locks;

      // synthetic_locks does not exist in v7.0.2 node due to a mistake. In this case, processing cannot be performed.
      if (!superfluidUndelegationLocks) {
        console.error(
          "there is no synthetic_locks from response. check your node's version"
        );
        return undefined;
      }

      if (
        superfluidUndelegationRecords.length !==
        superfluidUndelegationLocks.length
      ) {
        throw new Error("Undelegation records and locks are different.");
      }

      return superfluidUndelegationRecords
        .filter(
          (record) =>
            record.delegation_amount.denom ===
            poolShareCurrency.coinMinimalDenom
        )
        .map((record) => {
          const syntheticLock = superfluidUndelegationLocks.find(
            (lock) =>
              lock.synth_denom ===
              `${poolShareCurrency.coinMinimalDenom}/superunbonding/${record.validator_address}`
          );

          if (!syntheticLock) {
            throw new Error(
              `Can't find synthetic lock for ${poolShareCurrency.coinMinimalDenom}, ${record.validator_address}`
            );
          }

          return {
            delegator_address: record.delegator_address,
            validator_address: record.validator_address,
            amount: new CoinPretty(
              poolShareCurrency,
              new Dec(record.delegation_amount.amount)
            ),
            duration: dayjs.duration(
              parseInt(syntheticLock.duration.replace("s", "")) * 1000
            ),
            end_time: new Date(syntheticLock.end_time),
            lock_id: syntheticLock.underlying_lock_id,
          };
        });
    }
  );
}

export class ObservableQuerySuperfluidUndelegations extends ObservableChainQueryMap<SuperfluidUndelegationsResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (delegatorBech32Address) => {
      return new ObservableQuerySuperfluidUndelegationsInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        delegatorBech32Address
      );
    });
  }

  getQuerySuperfluidDelegations(
    delegatorBech32Address: string
  ): ObservableQuerySuperfluidUndelegationsInner {
    return this.get(
      delegatorBech32Address
    ) as ObservableQuerySuperfluidUndelegationsInner;
  }
}
