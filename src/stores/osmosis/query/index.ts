import { ObservableQueryPools } from './pools';
import { ChainGetter, QueriesSetBase, QueriesWithCosmos } from '@keplr-wallet/stores';
import { KVStore } from '@keplr-wallet/common';
import { DeepReadonly } from 'utility-types';
import { ObservableQueryGammPoolShare } from './pool-share';
import { ObservableQueryTotalPools } from './pools/total-pools';
import { ObservableQueryPool } from './pool';
import { ObservableQueryIncentivizedPools, ObservableQueryLockableDurations } from './pool-incentives';
import { ObservableQueryEpochs } from './epochs';
import {
	ObservableQueryAccountLockedCoins,
	ObservableQueryAccountUnlockableCoins,
	ObservableQueryAccountUnlockingCoins,
} from './lockup';

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
	public readonly queryIncentivizedPools: DeepReadonly<ObservableQueryIncentivizedPools>;
	public readonly queryLockableDurations: DeepReadonly<ObservableQueryLockableDurations>;

	public readonly queryLockedCoins: DeepReadonly<ObservableQueryAccountLockedCoins>;
	public readonly queryUnlockingCoins: DeepReadonly<ObservableQueryAccountUnlockingCoins>;
	public readonly queryUnlockableCoins: DeepReadonly<ObservableQueryAccountUnlockableCoins>;

	public readonly queryEpochs: DeepReadonly<ObservableQueryEpochs>;

	constructor(queries: QueriesSetBase, kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		const queryGammPool = new ObservableQueryPool(kvStore, chainId, chainGetter);

		this.queryGammPools = new ObservableQueryPools(kvStore, chainId, chainGetter, queryGammPool);
		this.queryGammTotalPools = new ObservableQueryTotalPools(kvStore, chainId, chainGetter);
		this.queryGammPoolShare = new ObservableQueryGammPoolShare(this.queryGammPools, queries.queryBalances);
		this.queryIncentivizedPools = new ObservableQueryIncentivizedPools(kvStore, chainId, chainGetter);
		this.queryLockableDurations = new ObservableQueryLockableDurations(kvStore, chainId, chainGetter);

		this.queryLockedCoins = new ObservableQueryAccountLockedCoins(kvStore, chainId, chainGetter);
		this.queryUnlockingCoins = new ObservableQueryAccountUnlockingCoins(kvStore, chainId, chainGetter);
		this.queryUnlockableCoins = new ObservableQueryAccountUnlockableCoins(kvStore, chainId, chainGetter);

		this.queryEpochs = new ObservableQueryEpochs(kvStore, chainId, chainGetter);
	}
}
