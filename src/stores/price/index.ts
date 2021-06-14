import { CoinGeckoPriceStore } from '@keplr-wallet/stores';
import { KVStore } from '@keplr-wallet/common';
import { FiatCurrency } from '@keplr-wallet/types';
import { computed, makeObservable, observable } from 'mobx';
import { ObservableQueryPools } from '../osmosis/query/pools';
import { Dec } from '@keplr-wallet/unit';

export interface IntermidiateRoute {
	readonly alternativeCoinId: string;
	readonly poolId: string;
	readonly spotPriceSourceDenom: string;
	readonly spotPriceDestDenom: string;
	readonly destCoinId: string;
}

/**
 * PoolIntermediatePriceStore permits the some currencies that are not listed on the coingecko
 * to use the spot price of the pool as the intermediate.
 */
export class PoolIntermediatePriceStore extends CoinGeckoPriceStore {
	@observable.shallow
	protected _intermidiateRoutes: IntermidiateRoute[] = [];

	constructor(
		kvStore: KVStore,
		supportedVsCurrencies: {
			[vsCurrency: string]: FiatCurrency;
		},
		protected readonly queryPool: ObservableQueryPools,
		intermidiateRoutes: IntermidiateRoute[]
	) {
		super(kvStore, supportedVsCurrencies);

		this._intermidiateRoutes = intermidiateRoutes;

		makeObservable(this);
	}

	@computed
	get intermidiateRoutesMap(): Map<string, IntermidiateRoute> {
		const result: Map<string, IntermidiateRoute> = new Map();

		for (const route of this._intermidiateRoutes) {
			result.set(route.alternativeCoinId, route);
		}

		return result;
	}

	getPrice(coinId: string, vsCurrency: string): number | undefined {
		const routes = this.intermidiateRoutesMap;
		const route = routes.get(coinId);
		if (route) {
			const pool = this.queryPool.getPool(route.poolId);
			if (!pool) {
				return;
			}

			const inSpotPrice = pool.calculateSpotPriceWithoutSwapFee(route.spotPriceSourceDenom, route.spotPriceDestDenom);
			const spotPriceDec = inSpotPrice.toDec().equals(new Dec(0)) ? new Dec(0) : new Dec(1).quo(inSpotPrice.toDec());
			const destCoinPrice = super.getPrice(route.destCoinId, vsCurrency);
			if (destCoinPrice === undefined) {
				return;
			}

			return parseFloat(spotPriceDec.toString()) * destCoinPrice;
		}

		return super.getPrice(coinId, vsCurrency);
	}
}
