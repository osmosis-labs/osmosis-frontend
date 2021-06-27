import { ChainGetter } from '@keplr-wallet/stores';
import { KVStore } from '@keplr-wallet/common';
import { makeObservable } from 'mobx';
import { ObservableQueryPool, QueriedPoolBase } from '../pool';
import { ObservableQueryPoolsPagination } from './page';

export class ObservableQueryPools extends ObservableQueryPoolsPagination {
	constructor(
		kvStore: KVStore,
		chainId: string,
		chainGetter: ChainGetter,
		protected queryGammPool: ObservableQueryPool
	) {
		super(kvStore, chainId, chainGetter);

		makeObservable(this);
	}

	/**
	 * Pagination으로 받아오는 값과 pool id로 직접 받아오는 pool data를 효율적으로 다루기 위해서
	 * ObservableQueryPool을 직접 쓰지않고 ObservableQueryPools에서 공통적으로 관리한다.
	 * 이 메소드는 ObservableQueryPool에 직접적으로 접근할 때 사용한다.
	 * @param id
	 */
	getObservableQueryPool(id: string) {
		return this.queryGammPool.getPool(id);
	}

	getPool(id: string): QueriedPoolBase | undefined {
		return this.queryGammPool.getPool(id).pool;
	}
}
