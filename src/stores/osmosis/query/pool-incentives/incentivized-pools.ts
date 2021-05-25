import { ObservableChainQuery } from '@keplr-wallet/stores/build/query/chain-query';
import { KVStore } from '@keplr-wallet/common';
import { ChainGetter } from '@keplr-wallet/stores/src/common/index';
import { computedFn } from 'mobx-utils';
import { Dec, IntPretty } from '@keplr-wallet/unit';
import { IncentivizedPools } from './types';
import { computed, makeObservable } from 'mobx';

export class ObservableQueryIncentivizedPools extends ObservableChainQuery<IncentivizedPools> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter, '/osmosis/pool-incentives/v1beta1/incentivized_pools');

		makeObservable(this);
	}

	@computed
	get incentivizedPools(): string[] {
		if (!this.response) {
			return [];
		}

		const result = this.response.data.incentivized_pools.map(incentivizedPool => incentivizedPool.pool_id);

		// Remove the duplicates.
		return [...new Set(result)];
	}

	/**
	 * 리워드를 받을 수 있는 풀의 연당 이익률을 반환한다.
	 * 리워드를 받을 수 없는 풀일 경우 0를 리턴한다.
	 * TODO: 근데 아직 구현안됨 ㅋ
	 */
	readonly computeAPY = computedFn(
		(poolId: string): IntPretty => {
			return new IntPretty(new Dec(0)).maxDecimals(2).trim(true);
		}
	);
}
