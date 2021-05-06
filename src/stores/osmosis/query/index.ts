import { ObservableQueryPools } from './pools';
import { ChainGetter, QueriesSetBase, QueriesWithCosmos } from '@keplr-wallet/stores';
import { KVStore } from '@keplr-wallet/common';
import { DeepReadonly } from 'utility-types';
import { ObservableQueryGammPoolShare } from './pool-share';
import { ObservableQueryTotalPools } from './pools/total-pools';
import { ObservableQueryPool } from './pool';

export interface HasOsmosisQueries {
	osmosis: OsmosisQueries;
}

export class QueriesWithCosmosAndOsmosis extends QueriesWithCosmos implements HasOsmosisQueries {
	public readonly osmosis: DeepReadonly<OsmosisQueries>;

	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter);

		this.osmosis = new OsmosisQueries(this, kvStore, chainId, chainGetter);
	}
}

export class OsmosisQueries {
	public readonly queryGammPools: DeepReadonly<ObservableQueryPools>;
	public readonly queryGammTotalPools: DeepReadonly<ObservableQueryTotalPools>;
	public readonly queryGammPoolShare: DeepReadonly<ObservableQueryGammPoolShare>;

	constructor(queries: QueriesSetBase, kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		const queryGammPool = new ObservableQueryPool(kvStore, chainId, chainGetter);

		this.queryGammPools = new ObservableQueryPools(kvStore, chainId, chainGetter, queryGammPool);
		this.queryGammTotalPools = new ObservableQueryTotalPools(kvStore, chainId, chainGetter);
		this.queryGammPoolShare = new ObservableQueryGammPoolShare(this.queryGammPools, queries.queryBalances);
	}
}
