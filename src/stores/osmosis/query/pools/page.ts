import { ObservableChainQuery } from '@keplr-wallet/stores/build/query/chain-query';
import { Pools } from './types';
import { ChainGetter, QueryResponse } from '@keplr-wallet/stores';
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

	protected setResponse(response: Readonly<QueryResponse<Pools>>) {
		super.setResponse(response);

		const chainInfo = this.chainGetter.getChain(this.chainId);
		const denomsInPools: string[] = [];
		// Response에 있는 pool안의 asset의 denom들을 등록하도록 시도한다. (IBC 토큰들을 위해서)
		for (const pool of response.data.pools) {
			for (const asset of pool.poolAssets) {
				denomsInPools.push(asset.token.denom);
			}
		}

		chainInfo.addUnknownCurrencies(...denomsInPools);
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
