import { ObservableQueryPools, ObservableQueryNumPools } from './pools';
import {
	ChainGetter,
	CosmwasmQueries,
	HasCosmwasmQueries,
	QueriesSetBase,
	QueriesWithCosmos,
} from '@keplr-wallet/stores';
import { KVStore } from '@keplr-wallet/common';
import { DeepReadonly } from 'utility-types';
import { ObservableQueryGammPoolShare } from './pool-share';
import { ObservableQueryPool } from './pool';
import { ObservableQueryIncentivizedPools, ObservableQueryLockableDurations } from './pool-incentives';
import { ObservableQueryEpochs } from './epochs';
import {
	ObservableQueryAccountLockedCoins,
	ObservableQueryAccountUnlockingCoins,
	ObservableQueryAccountLocked,
} from './lockup';
import { ObservableQueryEpochProvisions, ObservableQueryMintParmas } from './mint';
import { ObservableQueryDistrInfo } from './pool-incentives/distr-info';
import { ObservableQueryTotalCliamable, ObservableQueryClaimRecord, ObservableQueryClaimParams } from './claim';
import { ObservableQueryGuage } from './incentives';
import { ObservableQueryPoolCreationFee } from './pool-creation-fee';

export interface HasOsmosisQueries {
	osmosis: OsmosisQueries;
}

export class QueriesWithCosmosAndOsmosis extends QueriesWithCosmos implements HasOsmosisQueries, HasCosmwasmQueries {
	public readonly osmosis: DeepReadonly<OsmosisQueries>;
	public readonly cosmwasm: DeepReadonly<CosmwasmQueries>;

	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter);

		this.osmosis = new OsmosisQueries(this, kvStore, chainId, chainGetter);
		this.cosmwasm = new CosmwasmQueries(this, kvStore, chainId, chainGetter);
	}
}

export class OsmosisQueries {
	public readonly queryGammPools: DeepReadonly<ObservableQueryPools>;
	public readonly queryGammNumPools: DeepReadonly<ObservableQueryNumPools>;
	public readonly queryGammPoolShare: DeepReadonly<ObservableQueryGammPoolShare>;

	public readonly queryLockedCoins: DeepReadonly<ObservableQueryAccountLockedCoins>;
	public readonly queryUnlockingCoins: DeepReadonly<ObservableQueryAccountUnlockingCoins>;
	public readonly queryAccountLocked: DeepReadonly<ObservableQueryAccountLocked>;

	public readonly queryMintParams: DeepReadonly<ObservableQueryMintParmas>;
	public readonly queryEpochProvisions: DeepReadonly<ObservableQueryEpochProvisions>;

	public readonly queryEpochs: DeepReadonly<ObservableQueryEpochs>;

	public readonly queryLockableDurations: DeepReadonly<ObservableQueryLockableDurations>;
	public readonly queryDistrInfo: DeepReadonly<ObservableQueryDistrInfo>;
	public readonly queryIncentivizedPools: DeepReadonly<ObservableQueryIncentivizedPools>;
	public readonly queryGauge: DeepReadonly<ObservableQueryGuage>;

	public readonly queryTotalClaimable: DeepReadonly<ObservableQueryTotalCliamable>;
	public readonly queryClaimRecord: DeepReadonly<ObservableQueryClaimRecord>;
	public readonly queryClaimParams: DeepReadonly<ObservableQueryClaimParams>;

	public readonly queryPoolCreationFee: DeepReadonly<ObservableQueryPoolCreationFee>;

	constructor(queries: QueriesSetBase, kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		const queryGammPool = new ObservableQueryPool(kvStore, chainId, chainGetter);

		this.queryLockedCoins = new ObservableQueryAccountLockedCoins(kvStore, chainId, chainGetter);
		this.queryUnlockingCoins = new ObservableQueryAccountUnlockingCoins(kvStore, chainId, chainGetter);
		this.queryAccountLocked = new ObservableQueryAccountLocked(kvStore, chainId, chainGetter);

		this.queryGammPools = new ObservableQueryPools(kvStore, chainId, chainGetter, queryGammPool);
		this.queryGammNumPools = new ObservableQueryNumPools(kvStore, chainId, chainGetter);
		this.queryGammPoolShare = new ObservableQueryGammPoolShare(
			this.queryGammPools,
			queries.queryBalances,
			this.queryLockedCoins,
			this.queryUnlockingCoins
		);

		this.queryMintParams = new ObservableQueryMintParmas(kvStore, chainId, chainGetter);
		this.queryEpochProvisions = new ObservableQueryEpochProvisions(kvStore, chainId, chainGetter, this.queryMintParams);

		this.queryEpochs = new ObservableQueryEpochs(kvStore, chainId, chainGetter);

		this.queryLockableDurations = new ObservableQueryLockableDurations(kvStore, chainId, chainGetter);
		this.queryDistrInfo = new ObservableQueryDistrInfo(kvStore, chainId, chainGetter);
		this.queryIncentivizedPools = new ObservableQueryIncentivizedPools(
			kvStore,
			chainId,
			chainGetter,
			this.queryLockableDurations,
			this.queryDistrInfo,
			this.queryGammPools,
			this.queryMintParams,
			this.queryEpochProvisions,
			this.queryEpochs
		);
		this.queryGauge = new ObservableQueryGuage(kvStore, chainId, chainGetter);

		this.queryTotalClaimable = new ObservableQueryTotalCliamable(kvStore, chainId, chainGetter);
		this.queryClaimRecord = new ObservableQueryClaimRecord(kvStore, chainId, chainGetter);
		this.queryClaimParams = new ObservableQueryClaimParams(kvStore, chainId, chainGetter);

		this.queryPoolCreationFee = new ObservableQueryPoolCreationFee(kvStore, chainId, chainGetter);
	}
}
