import { ObservableChainQuery, ObservableChainQueryMap } from '@keplr-wallet/stores/build/query/chain-query';
import { Pool } from './types';
import { KVStore } from '@keplr-wallet/common';
import { ChainGetter } from '@keplr-wallet/stores/src/common/index';
import { makeObservable, computed } from 'mobx';
import { QueriedPoolBase } from './base';

export class ObservableQueryPoolInner extends ObservableChainQuery<Pool> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, protected readonly poolId: string) {
		super(kvStore, chainId, chainGetter, `/osmosis/gamm/v1beta1/${poolId}`);

		makeObservable(this);
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
