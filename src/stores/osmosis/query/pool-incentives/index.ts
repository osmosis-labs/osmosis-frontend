import { ObservableChainQuery } from '@keplr-wallet/stores/build/query/chain-query';
import { KVStore } from '@keplr-wallet/common';
import { ChainGetter } from '@keplr-wallet/stores/src/common/index';
import { computedFn } from 'mobx-utils';
import { Dec, IntPretty } from '@keplr-wallet/unit';

export class ObservableQueryPoolIncentives extends ObservableChainQuery<unknown> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		// TODO: 아직 구현 안됨.
		super(kvStore, chainId, chainGetter, ``);
	}

	/**
	 * 리워드를 받을 수 있는 풀들의 id를 반환한다.
	 * TODO: 아직 구현안됨 일단 그냥 1,2,3을 리턴한다.
	 */
	getIncentivizedPools(): string[] {
		return ['1', '2', '3'];
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
