import { KVStore } from '@keplr-wallet/common';
import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap } from '@keplr-wallet/stores';
import {
	SuperfluidUndelegation,
	SuperfluidUndelegationRecordsResponse,
	SuperfluidUndelegationsResponse,
} from './types';
import { makeObservable } from 'mobx';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { Currency } from '@keplr-wallet/types';
import { computedFn } from 'mobx-utils';

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

	readonly getUndelegations = computedFn((poolShareCurrency: Currency): SuperfluidUndelegation[] | undefined => {
		if (!this.response) {
			return undefined;
		}

		const validatorCombinedUndelegationRecordMap = this.response.data.superfluid_delegation_records.reduce(
			(undelecationRecordMap, undelegationRecord) => {
				const undelegationRecordMapKey = `${undelegationRecord.delegation_amount.denom}/${undelegationRecord.validator_address}`;
				const combiningUndelegationRecord = undelecationRecordMap.get(undelegationRecordMapKey);

				if (combiningUndelegationRecord) {
					const combinedDelegationAmount = new Dec(combiningUndelegationRecord.delegation_amount.amount).add(
						new Dec(undelegationRecord.delegation_amount.amount)
					);

					undelecationRecordMap.set(undelegationRecordMapKey, {
						...undelegationRecord,
						delegation_amount: {
							...combiningUndelegationRecord.delegation_amount,
							amount: combinedDelegationAmount.toString(),
						},
					});
				} else {
					undelecationRecordMap.set(undelegationRecordMapKey, undelegationRecord);
				}

				return undelecationRecordMap;
			},
			new Map<string, SuperfluidUndelegationRecordsResponse>()
		);

		const validatorCombinedUndelegationRecords = [...validatorCombinedUndelegationRecordMap.values()];

		return validatorCombinedUndelegationRecords.map(record => ({
			delegator_address: record.delegator_address,
			validator_address: record.validator_address,
			amount: new CoinPretty(poolShareCurrency, new Dec(record.delegation_amount.amount)),
		}));
	});
}

export class ObservableQuerySuperfluidUndelegations extends ObservableChainQueryMap<SuperfluidUndelegationsResponse> {
	constructor(
		protected readonly kvStore: KVStore,
		protected readonly chainId: string,
		protected readonly chainGetter: ChainGetter
	) {
		super(kvStore, chainId, chainGetter, delegatorBech32Address => {
			return new ObservableQuerySuperfluidUndelegationsInner(
				this.kvStore,
				this.chainId,
				this.chainGetter,
				delegatorBech32Address
			);
		});
	}

	getQuerySuperfluidDelegations(delegatorBech32Address: string): ObservableQuerySuperfluidUndelegationsInner {
		return this.get(delegatorBech32Address) as ObservableQuerySuperfluidUndelegationsInner;
	}
}
