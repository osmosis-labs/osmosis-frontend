// TODO: Keplr 본체에서 import path 수정하기
import { ObservableQueryBalances } from '@keplr-wallet/stores/build/query/balances';
import { CoinPretty, DecUtils, Int, IntPretty } from '@keplr-wallet/unit';
import { Currency } from '@keplr-wallet/types';
import { ObservableQueryPools } from '../pools';
import { computedFn } from 'mobx-utils';

// TODO: 수정해야됨. 좀 병맛같은 구현
// 일단 이 스토어를 사용하게 되면 계속 Balances를 observe하는 상태가 되서
// Balances가 언제 observe, unobserve될 지 예측하기 힘들어진다...
export class ObservableQueryGammPoolShare {
	constructor(
		protected readonly queryPools: ObservableQueryPools,
		protected readonly queryBalances: ObservableQueryBalances
	) {}

	/**
	 * 특정 주소가 소유하고 있는 모든 share들의 pool id 배열을 반환한다.
	 */
	readonly getOwnPools = computedFn((bech32Address: string): string[] => {
		const balances = this.queryBalances.getQueryBech32Address(bech32Address).positiveBalances;

		const result: string[] = [];

		for (const bal of balances) {
			// Pool share 토큰은 `gamm/pool/${poolId}` 형태이다.
			if (bal.currency.coinMinimalDenom.startsWith('gamm/pool/')) {
				result.push(bal.currency.coinMinimalDenom.replace('gamm/pool/', ''));
			}
		}

		result.sort((e1, e2) => {
			return parseInt(e1) >= parseInt(e2) ? 1 : -1;
		});

		return result;
	});

	getGammShare(bech32Address: string, poolId: string): CoinPretty {
		const currency: Currency = {
			coinDenom: `GAMM/${poolId}`,
			coinMinimalDenom: `gamm/pool/${poolId}`,
			coinDecimals: 18,
		};

		return this.queryBalances.getQueryBech32Address(bech32Address).getBalanceFromCurrency(currency);
	}

	getGammShareRatio(bech32Address: string, poolId: string): IntPretty {
		const pool = this.queryPools.getPool(poolId);
		if (!pool) {
			return new IntPretty(new Int(0)).ready(false);
		}

		const share = this.getGammShare(bech32Address, poolId);

		if (!share.isReady) {
			return new IntPretty(new Int(0)).ready(false);
		}

		const totalShare = pool.totalShare;

		// 백분률로 만들어주기 위해서 마지막에 10^2를 곱한다
		return new IntPretty(
			share
				.toDec()
				.quo(totalShare.toDec())
				.mul(DecUtils.getPrecisionDec(2))
		)
			.maxDecimals(2)
			.trim(true);
	}
}
