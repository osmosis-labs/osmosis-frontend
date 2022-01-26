import { ChainGetter, CoinGeckoPriceStore } from '@keplr-wallet/stores';
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
		protected readonly osmosisChainId: string,
		protected readonly chainGetter: ChainGetter,
		kvStore: KVStore,
		supportedVsCurrencies: {
			[vsCurrency: string]: FiatCurrency;
		},
		defaultVsCurrency: string,
		protected readonly queryPool: ObservableQueryPools,
		intermidiateRoutes: IntermidiateRoute[]
	) {
		super(kvStore, supportedVsCurrencies, defaultVsCurrency);

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
		try {
			const routes = this.intermidiateRoutesMap;
			const route = routes.get(coinId);
			if (route) {
				const pool = this.queryPool.getPool(route.poolId);
				if (!pool) {
					return;
				}

				const osmosisChainInfo = this.chainGetter.getChain(this.osmosisChainId);
				// If the currencies are unknown yet,
				// it is assumed that the raw currency with the 0 decimals.
				// But, using this raw currency will make improper result because it will create greater spot price than expected.
				// So, if the currencies are unknown, block calculating the price.
				if (
					!osmosisChainInfo.currencies.find(cur => cur.coinMinimalDenom === route.spotPriceSourceDenom) ||
					!osmosisChainInfo.currencies.find(cur => cur.coinMinimalDenom === route.spotPriceDestDenom)
				) {
					return;
				}

				const inSpotPrice = pool.calculateSpotPriceWithoutSwapFee(route.spotPriceSourceDenom, route.spotPriceDestDenom);
				const spotPriceDec = inSpotPrice.toDec().equals(new Dec(0)) ? new Dec(0) : new Dec(1).quo(inSpotPrice.toDec());
				const destCoinPrice = this.getPrice(route.destCoinId, vsCurrency);
				if (destCoinPrice === undefined) {
					return;
				}

				const res = parseFloat(spotPriceDec.toString()) * destCoinPrice;
				if (Number.isNaN(res)) {
					return;
				}
				// CoinGeckoPriceStore uses the `Dec` to calculate the price of assets.
				// However, `Dec` requires that the decimals must not exceed 18.
				// Since the spot price is `Dec`, it can have 18 decimals,
				// and if the `destCoinPrice` has the fraction, the multiplication can make the more than 18 decimals.
				// To prevent this problem, shorthand the fraction part.
				return parseFloat(res.toFixed(10));
			}

			return super.getPrice(coinId, vsCurrency);
		} catch (e) {
			console.log(`Failed to calculate price of (${coinId}, ${vsCurrency}): ${e?.message}`);
			return undefined;
		}
	}
}
