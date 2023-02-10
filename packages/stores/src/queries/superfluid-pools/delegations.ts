import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import {
  SuperfluidDelegation,
  SuperfluidDelegationRecordsResponse,
  SuperfluidDelegationsResponse,
} from "./types";

export class ObservableQuerySuperfluidDelegationsInner extends ObservableChainQuery<SuperfluidDelegationsResponse> {
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
      `/osmosis/superfluid/v1beta1/superfluid_delegations/${delegatorBech32Address}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.delegatorBech32Address !== "";
  }

  readonly getDelegations = computedFn(
    (poolShareCurrency: Currency): SuperfluidDelegation[] | undefined => {
      if (!this.response) {
        return undefined;
      }

      const validatorCombinedDelegationRecordMap =
        this.response.data.superfluid_delegation_records.reduce(
          (delecationRecordMap, delegationRecord) => {
            if (
              delegationRecord.delegation_amount.denom !==
              poolShareCurrency.coinMinimalDenom
            ) {
              return delecationRecordMap;
            }

            const delegationRecordMapKey = `${delegationRecord.delegation_amount.denom}/${delegationRecord.validator_address}`;
            const combiningDelegationRecord = delecationRecordMap.get(
              delegationRecordMapKey
            );

            if (combiningDelegationRecord) {
              const combinedDelegationAmount = new Int(
                combiningDelegationRecord.delegation_amount.amount
              ).add(new Int(delegationRecord.delegation_amount.amount));

              delecationRecordMap.set(delegationRecordMapKey, {
                ...delegationRecord,
                delegation_amount: {
                  ...combiningDelegationRecord.delegation_amount,
                  amount: combinedDelegationAmount.toString(),
                },
              });
            } else {
              delecationRecordMap.set(delegationRecordMapKey, delegationRecord);
            }

            return delecationRecordMap;
          },
          new Map<string, SuperfluidDelegationRecordsResponse>()
        );

      const validatorCombinedDelegationRecords = [
        ...validatorCombinedDelegationRecordMap.values(),
      ];

      return validatorCombinedDelegationRecords
        .filter((record) =>
          new Int(record.delegation_amount.amount).gt(new Int(0))
        )
        .map((record) => ({
          delegator_address: record.delegator_address,
          validator_address: record.validator_address,
          amount: new CoinPretty(
            poolShareCurrency,
            new Int(record.delegation_amount.amount)
          ),
        }));
    }
  );
}

export class ObservableQuerySuperfluidDelegations extends ObservableChainQueryMap<SuperfluidDelegationsResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (delegatorBech32Address) => {
      return new ObservableQuerySuperfluidDelegationsInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        delegatorBech32Address
      );
    });
  }

  getQuerySuperfluidDelegations(
    delegatorBech32Address: string
  ): ObservableQuerySuperfluidDelegationsInner {
    return this.get(
      delegatorBech32Address
    ) as ObservableQuerySuperfluidDelegationsInner;
  }
}
