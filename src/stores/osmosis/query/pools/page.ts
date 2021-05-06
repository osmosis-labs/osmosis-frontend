import { ObservableChainQuery } from '@keplr-wallet/stores/build/query/chain-query';
import { Pools } from './types';
import { ChainGetter } from '@keplr-wallet/stores';
import { KVStore } from '@keplr-wallet/common';
import { computed, makeObservable } from 'mobx';
import { QueriedPoolBase } from '../pool';

export class ObservableQueryPoolsPagination extends ObservableChainQuery<Pools> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, itemsPerPage: number, page: number) {
		super(
			kvStore,
			chainId,
			chainGetter,
			`/osmosis/gamm/v1beta1/pools/all?pagination.offset=${(page - 1) * itemsPerPage}&pagination.limit=${itemsPerPage}`
		);

		makeObservable(this);
	}

	@computed
	get pools(): QueriedPoolBase[] {
		if (!this.response) {
			return [];
		}

		return this.response.data.pools.map(pool => {
			return new QueriedPoolBase(this.chainId, this.chainGetter, pool);
		});
	}
}
