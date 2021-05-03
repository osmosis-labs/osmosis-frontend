import { CoinGeckoPriceStore, getKeplrFromWindow, QueriesStore } from '@keplr-wallet/stores';
import { AccountStore } from '@keplr-wallet/stores';
import { IndexedDBKVStore } from '@keplr-wallet/common';
import { ChainStore } from './chain';

import { ChainInfo } from '@keplr-wallet/types';

import { EmbedChainInfos } from '../config';
import { QueriesWithCosmosAndOsmosis } from './osmosis/query';
import { AccountWithCosmosAndOsmosis } from './osmosis/account';
import { LayoutStore } from './layout';

export class RootStore {
	public readonly chainStore: ChainStore;
	public readonly accountStore: AccountStore<AccountWithCosmosAndOsmosis>;
	public readonly queriesStore: QueriesStore<QueriesWithCosmosAndOsmosis>;
	public readonly priceStore: CoinGeckoPriceStore;

	public readonly layoutStore: LayoutStore;

	constructor() {
		this.chainStore = new ChainStore(EmbedChainInfos, 'localnet-1');

		this.queriesStore = new QueriesStore(
			new IndexedDBKVStore('store_web_queries'),
			this.chainStore,
			getKeplrFromWindow,
			QueriesWithCosmosAndOsmosis
		);

		this.accountStore = new AccountStore(window, AccountWithCosmosAndOsmosis, this.chainStore, this.queriesStore, {
			defaultOpts: {
				prefetching: false,
				suggestChain: false,
				autoInit: false,
				getKeplr: getKeplrFromWindow,
			},
			chainOpts: this.chainStore.chainInfos.map((chainInfo: ChainInfo) => {
				if (chainInfo.chainId.startsWith('localnet')) {
					return {
						chainId: chainInfo.chainId,
						suggestChain: true,
					};
				}

				return {
					chainId: chainInfo.chainId,
				};
			}),
		});

		this.priceStore = new CoinGeckoPriceStore(new IndexedDBKVStore('store_web_prices'), {
			usd: {
				currency: 'usd',
				symbol: '$',
				maxDecimals: 2,
				locale: 'en-US',
			},
		});

		this.layoutStore = new LayoutStore();
	}
}

export function createRootStore() {
	return new RootStore();
}
