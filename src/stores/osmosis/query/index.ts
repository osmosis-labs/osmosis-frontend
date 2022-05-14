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
	ObservableSyntheticLockupsByLockId,
} from './lockup';
import { ObservableQueryEpochProvisions, ObservableQueryMintParmas } from './mint';
import { ObservableQueryDistrInfo } from './pool-incentives/distr-info';
import { ObservableQueryTotalCliamable, ObservableQueryClaimRecord, ObservableQueryClaimParams } from './claim';
import { ObservableQueryGuage } from './incentives';
import { ObservableQueryPoolCreationFee } from './pool-creation-fee';
import {
	ObservableQuerySuperfluidDelegations,
	ObservableQuerySuperfluidPools,
	ObservableQuerySuperfluidUndelegations,
	ObservableQuerySuperfluidAssetMultiplier,
	ObservableQuerySuperfluidOsmoEquivalent,
	ObservableQuerySuperfluidParams,
} from './superfluid-pools';

export interface HasOsmosisQueries {
	osmosis: OsmosisQueries;
}

export class QueriesWithCosmosAndOsmosis extends QueriesWithCosmos implements HasOsmosisQueries, HasCosmwasmQueries {
	public readonly osmosis: DeepReadonly<OsmosisQueries>;
	public readonly cosmwasm: DeepReadonly<CosmwasmQueries>;

	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter);

		this.osmosis = new OsmosisQueries(this, kvStore, chainId, chainGetter, {
			// Explicitly hide the terra related pools from incentivized pools.
			disabledIncentivizedPoolIds: {
				'560': true,
				'561': true,
				'562': true,
				'565': true,
				'567': true,
				'578': true,
				'580': true,
				'592': true,
				'610': true,
				'612': true,
				'615': true,
				'642': true,
			},
		});
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
	public readonly querySyntheticLockupsByLockId: DeepReadonly<ObservableSyntheticLockupsByLockId>;

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

	public readonly querySuperfluidPools: DeepReadonly<ObservableQuerySuperfluidPools>;
	public readonly querySuperfluidDelegations: DeepReadonly<ObservableQuerySuperfluidDelegations>;
	public readonly querySuperfluidUndelegations: DeepReadonly<ObservableQuerySuperfluidUndelegations>;
	public readonly querySuperfluidParams: DeepReadonly<ObservableQuerySuperfluidParams>;
	public readonly querySuperfluidAssetMultiplier: DeepReadonly<ObservableQuerySuperfluidAssetMultiplier>;
	public readonly querySuperfluidOsmoEquivalent: DeepReadonly<ObservableQuerySuperfluidOsmoEquivalent>;

	constructor(
		queries: QueriesSetBase,
		kvStore: KVStore,
		chainId: string,
		chainGetter: ChainGetter,
		options: {
			disabledIncentivizedPoolIds?: Record<string, boolean>;
		}
	) {
		const queryGammPool = new ObservableQueryPool(kvStore, chainId, chainGetter);

		this.queryLockedCoins = new ObservableQueryAccountLockedCoins(kvStore, chainId, chainGetter);
		this.queryUnlockingCoins = new ObservableQueryAccountUnlockingCoins(kvStore, chainId, chainGetter);
		this.queryAccountLocked = new ObservableQueryAccountLocked(kvStore, chainId, chainGetter);
		this.querySyntheticLockupsByLockId = new ObservableSyntheticLockupsByLockId(kvStore, chainId, chainGetter);

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
			this.queryEpochs,
			options.disabledIncentivizedPoolIds ?? {}
		);
		this.queryGauge = new ObservableQueryGuage(kvStore, chainId, chainGetter);

		this.queryTotalClaimable = new ObservableQueryTotalCliamable(kvStore, chainId, chainGetter);
		this.queryClaimRecord = new ObservableQueryClaimRecord(kvStore, chainId, chainGetter);
		this.queryClaimParams = new ObservableQueryClaimParams(kvStore, chainId, chainGetter);

		this.queryPoolCreationFee = new ObservableQueryPoolCreationFee(kvStore, chainId, chainGetter);

		this.querySuperfluidPools = new ObservableQuerySuperfluidPools(kvStore, chainId, chainGetter);
		this.querySuperfluidDelegations = new ObservableQuerySuperfluidDelegations(kvStore, chainId, chainGetter);
		this.querySuperfluidUndelegations = new ObservableQuerySuperfluidUndelegations(kvStore, chainId, chainGetter);
		this.querySuperfluidParams = new ObservableQuerySuperfluidParams(kvStore, chainId, chainGetter);
		this.querySuperfluidAssetMultiplier = new ObservableQuerySuperfluidAssetMultiplier(kvStore, chainId, chainGetter);
		this.querySuperfluidOsmoEquivalent = new ObservableQuerySuperfluidOsmoEquivalent(
			chainId,
			chainGetter,
			this.querySuperfluidParams,
			this.querySuperfluidAssetMultiplier,
			this.queryGammPools
		);
	}
}
