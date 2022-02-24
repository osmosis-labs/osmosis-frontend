import { KVStore } from '@keplr-wallet/common';
import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap } from '@keplr-wallet/stores';
import { SuperfluidDelegationRecords, SuperfluidDelegations } from './types';
import { computed, makeObservable } from 'mobx';
import { Dec } from '@keplr-wallet/unit';

export class ObservableQuerySuperfluidDelegationsInner extends ObservableChainQuery<SuperfluidDelegations> {
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

	@computed
	get delegations(): SuperfluidDelegations | undefined {
		if (!this.response) {
			return undefined;
		}

		const validatorCombinedDelegationRecordMap = this.response.data.superfluid_delegation_records.reduce(
			(delecationRecordMap, delegationRecord) => {
				const combiningDelegationRecord = delecationRecordMap.get(delegationRecord.validator_address);

				if (combiningDelegationRecord) {
					const combinedDelegationAmount = new Dec(combiningDelegationRecord.delegation_amount.amount).add(
						new Dec(delegationRecord.delegation_amount.amount)
					);

					delecationRecordMap.set(delegationRecord.validator_address, {
						...delegationRecord,
						delegation_amount: {
							...combiningDelegationRecord.delegation_amount,
							amount: combinedDelegationAmount.toString(),
						},
					});
				} else {
					delecationRecordMap.set(
						`${delegationRecord.validator_address}${delegationRecord.delegation_amount.denom}`,
						delegationRecord
					);
				}

				return delecationRecordMap;
			},
			new Map<string, SuperfluidDelegationRecords>()
		);

		const validatorCombinedDelegationRecords = [...validatorCombinedDelegationRecordMap.values()];

		return {
			superfluid_delegation_records: validatorCombinedDelegationRecords,
			total_delegated_coins: this.response.data.total_delegated_coins,
		};
	}
}

export class ObservableQuerySuperfluidDelegations extends ObservableChainQueryMap<SuperfluidDelegations> {
	constructor(
		protected readonly kvStore: KVStore,
		protected readonly chainId: string,
		protected readonly chainGetter: ChainGetter
	) {
		super(kvStore, chainId, chainGetter, delegatorBech32Address => {
			return new ObservableQuerySuperfluidDelegationsInner(
				this.kvStore,
				this.chainId,
				this.chainGetter,
				delegatorBech32Address
			);
		});
	}

	getQuerySuperfluidDelegations(delegatorBech32Address: string): ObservableQuerySuperfluidDelegationsInner {
		return this.get(delegatorBech32Address) as ObservableQuerySuperfluidDelegationsInner;
	}
}
