import { computed, makeObservable, observable } from 'mobx';
import { IntPretty } from '@keplr-wallet/unit';
import { ObservableQueryPools } from '../query/pools';
import { Currency } from '@keplr-wallet/types';

export interface SwapManagerPoolCurrency extends Currency {
	poolId: string;
}

export class GammSwapManager {
	@observable.ref
	protected swapCurrencies: SwapManagerPoolCurrency[];

	constructor(swapCurrencies: SwapManagerPoolCurrency[]) {
		this.swapCurrencies = swapCurrencies;

		makeObservable(this);
	}

	@computed
	get swappableCurrencies(): SwapManagerPoolCurrency[] {
		const currencies: Map<string, SwapManagerPoolCurrency> = new Map();

		for (const swapCurrency of this.swapCurrencies) {
			if (!currencies.has(swapCurrency.coinMinimalDenom)) {
				currencies.set(swapCurrency.coinMinimalDenom, swapCurrency);
			}
		}

		return Array.from(currencies.values());
	}

	computeOptimizedRoues(
		queryPool: ObservableQueryPools,
		inMinimalDenom: string,
		outMinimalDenom: string
	):
		| {
				poolId: string;
				spotPrice: IntPretty;
				swapFee: IntPretty;
		  }
		| undefined {
		// TODO: 아직까진 실제 라우트를 계산하지 않는다. 추후 추가...
		const inCurrency = this.swappableCurrencies.find(cur => cur.coinMinimalDenom === inMinimalDenom);
		const outCurrency = this.swappableCurrencies.find(cur => cur.coinMinimalDenom === outMinimalDenom);

		if (!inCurrency || !outCurrency) {
			throw new Error("Can't find the matched currency");
		}

		if (inCurrency.poolId !== outCurrency.poolId) {
			// 이렇게 하면 안되지만 일단 테스트용 수준으로 돌아가게 하기 위해서 대충 처리...
			throw new Error('Oops');
		}

		const pool = queryPool.getPool(inCurrency.poolId);
		if (!pool) {
			return undefined;
		}

		return {
			poolId: pool.id,
			spotPrice: pool.calculateSpotPrice(inMinimalDenom, outMinimalDenom),
			swapFee: pool.swapFee,
		};
	}
}
