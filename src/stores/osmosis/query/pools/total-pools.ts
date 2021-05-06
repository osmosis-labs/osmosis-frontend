import { ObservableChainQuery } from '@keplr-wallet/stores/build/query/chain-query';
import { TotalPools } from './types';
import { ChainGetter } from '@keplr-wallet/stores';
import { KVStore } from '@keplr-wallet/common';
import { computed, makeObservable } from 'mobx';
import { computedFn } from 'mobx-utils';

export class ObservableQueryTotalPools extends ObservableChainQuery<TotalPools> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter, '/osmosis/gamm/v1beta1/pools/total_pools');

		makeObservable(this);
	}

	@computed
	get totalPools(): number {
		if (!this.response) {
			return 0;
		}

		return parseInt(this.response.data.totalPools);
	}

	readonly computeTotalPages = computedFn((itemsPerPage: number): number => {
		const totalPools = this.totalPools;
		if (!totalPools) {
			return 1;
		}

		return Math.ceil(totalPools / itemsPerPage);
	});
}
