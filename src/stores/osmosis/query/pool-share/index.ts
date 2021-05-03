// TODO: Keplr 본체에서 import path 수정하기
import { ObservableQueryBalances } from '@keplr-wallet/stores/build/query/balances';
import { ObservableQueryCosmosBalances } from '@keplr-wallet/stores/build/query/cosmos/balance';
import { CoinPretty, DecUtils, Int, IntPretty } from '@keplr-wallet/unit';
import { Currency } from '@keplr-wallet/types';
import { ObservableQueryPools } from '../pools';

// TODO: 수정해야됨. 좀 병맛같은 구현
export class ObservableQueryGammPoolShare {
	constructor(
		protected readonly queryPools: ObservableQueryPools,
		protected readonly queryBalances: ObservableQueryBalances
	) {}

	getGammShare(bech32Address: string, poolId: string): CoinPretty {
		const balances = (this.queryBalances.getQueryBech32Address(bech32Address)
			.stakable as unknown) as ObservableQueryCosmosBalances;

		const currency: Currency = {
			coinDenom: `GAMM/${poolId}`,
			coinMinimalDenom: `gamm/pool/${poolId}`,
			coinDecimals: 6,
		};

		if (!balances.response) {
			return new CoinPretty(currency, new Int(0)).ready(false);
		}

		for (const primitive of balances.response.data.result) {
			if (primitive.denom === `gamm/pool/${poolId}`) {
				return new CoinPretty(currency, new Int(primitive.amount));
			}
		}

		return new CoinPretty(currency, new Int(0));
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
