import { KVStore } from '@keplr-wallet/common';
import { ChainGetter, ObservableChainQuery, QueryResponse } from '@keplr-wallet/stores';
import { FiatCurrency } from '@keplr-wallet/types';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { makeObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { QueriedPoolBase } from '../pool';
import { Pools } from './types';

export class ObservableQueryPoolsPagination extends ObservableChainQuery<Pools> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(
			kvStore,
			chainId,
			chainGetter,
			/*
			 기본 설정에서는 limit 없이 보낼 경우 100개까지 받아올 수 있다.
			 일단 현재로서는 풀이 100개가 넘을 때까지 오래 걸릴 것으로 보이기 때문에
			 얘가 100개까지 다 받아올 거라고 기대하고 limit, offset 설정없이 쿼리를 보낸다.
			 */
			`/osmosis/gamm/v1beta1/pools?pagination.limit=200`
		);

		makeObservable(this);
	}

	protected setResponse(response: Readonly<QueryResponse<Pools>>) {
		super.setResponse(response);

		const chainInfo = this.chainGetter.getChain(this.chainId);
		const denomsInPools: string[] = [];
		// Response에 있는 pool안의 asset의 denom들을 등록하도록 시도한다. (IBC 토큰들을 위해서)
		for (const pool of response.data.pools) {
			for (const asset of pool.poolAssets) {
				denomsInPools.push(asset.token.denom);
			}
		}

		chainInfo.addUnknownCurrencies(...denomsInPools);
	}

	computeAllTotalValueLocked = computedFn(
		(
			priceStore: { calculatePrice(vsCurrrency: string, coin: CoinPretty): PricePretty | undefined },
			fiatCurrency: FiatCurrency
		): PricePretty => {
			let price = new PricePretty(fiatCurrency, new Dec(0));
			if (!this.response) {
				return price;
			}

			this.response.data.pools.forEach(pool => {
				price = price.add(
					new QueriedPoolBase(this.chainId, this.chainGetter, pool).computeTotalValueLocked(priceStore, fiatCurrency)
				);
			});

			return price;
		}
	);

	getPools = computedFn((itemsPerPage: number, page: number): QueriedPoolBase[] => {
		if (!this.response) {
			return [];
		}

		const offset = (page - 1) * itemsPerPage;
		return this.response.data.pools.slice(offset, offset + itemsPerPage).map(pool => {
			return new QueriedPoolBase(this.chainId, this.chainGetter, pool);
		});
	});

	getPoolsDescendingOrderTVL = computedFn(
		(
			priceStore: { calculatePrice(vsCurrrency: string, coin: CoinPretty): PricePretty | undefined },
			fiatCurrency: FiatCurrency
		): QueriedPoolBase[] => {
			if (!this.response) {
				return [];
			}

			let pools = this.response.data.pools.map(pool => {
				return new QueriedPoolBase(this.chainId, this.chainGetter, pool);
			});

			pools = pools.sort((poolA: QueriedPoolBase, poolB: QueriedPoolBase) => {
				const poolATvl = poolA.computeTotalValueLocked(priceStore, fiatCurrency).toDec();
				const poolBTvl = poolB.computeTotalValueLocked(priceStore, fiatCurrency).toDec();
				return poolATvl.gt(poolBTvl) ? -1 : 1;
			});

			return pools;
		}
	);

	getPoolFromPagination = computedFn((id: string): QueriedPoolBase | undefined => {
		if (!this.response) {
			return undefined;
		}

		const pool = this.response.data.pools.find(pool => pool.id === id);
		if (!pool) {
			return undefined;
		}
		return new QueriedPoolBase(this.chainId, this.chainGetter, pool);
	});
}
