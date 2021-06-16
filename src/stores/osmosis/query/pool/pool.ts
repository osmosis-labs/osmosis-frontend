import { ChainGetter, QueryResponse, ObservableChainQuery, ObservableChainQueryMap } from '@keplr-wallet/stores';
import { Pool } from './types';
import { KVStore } from '@keplr-wallet/common';
import { makeObservable, computed } from 'mobx';
import { QueriedPoolBase } from './base';

export class ObservableQueryPoolInner extends ObservableChainQuery<Pool> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, protected readonly poolId: string) {
		super(kvStore, chainId, chainGetter, `/osmosis/gamm/v1beta1/pools/${poolId}`);

		makeObservable(this);
	}

	protected setResponse(response: Readonly<QueryResponse<Pool>>) {
		super.setResponse(response);

		const chainInfo = this.chainGetter.getChain(this.chainId);
		const denomsInPool: string[] = [];
		// Response에 있는 pool안의 asset의 denom들을 등록하도록 시도한다. (IBC 토큰들을 위해서)
		for (const asset of response.data.pool.poolAssets) {
			denomsInPool.push(asset.token.denom);
		}

		chainInfo.addUnknownCurrencies(...denomsInPool);
	}

	@computed
	get pool(): QueriedPoolBase | undefined {
		if (!this.response) {
			return undefined;
		}

		return new QueriedPoolBase(this.chainId, this.chainGetter, this.response.data.pool);
	}
}

export class ObservableQueryPool extends ObservableChainQueryMap<Pool> {
	constructor(
		protected readonly kvStore: KVStore,
		protected readonly chainId: string,
		protected readonly chainGetter: ChainGetter
	) {
		super(kvStore, chainId, chainGetter, poolId => {
			return new ObservableQueryPoolInner(this.kvStore, this.chainId, this.chainGetter, poolId);
		});
	}

	getPool(poolId: string): ObservableQueryPoolInner {
		return this.get(poolId) as ObservableQueryPoolInner;
	}
}
