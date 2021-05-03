import { QueriesStore } from '@keplr-wallet/stores';
import { AccountStore } from '@keplr-wallet/stores';
import { IndexedDBKVStore } from '@keplr-wallet/common';
import { ChainStore } from './chain';

import { ChainInfo } from '@keplr-wallet/types';

import { EmbedChainInfos } from '../confg';
import { LayoutStore } from './layout';

export class RootStore {
	public readonly chainStore: ChainStore;
	public readonly accountStore: AccountStore;
	public readonly queriesStore: QueriesStore;
	public layoutStore: LayoutStore;

	constructor() {
		// chain related stores
		this.chainStore = new ChainStore(EmbedChainInfos, 'localnet-2');
		this.queriesStore = new QueriesStore(new IndexedDBKVStore('store_web_queries'), this.chainStore);
		this.accountStore = new AccountStore(this.chainStore, this.queriesStore, {
			chainOpts: this.chainStore.chainInfos.map((chainInfo: ChainInfo) => {
				return {
					chainId: chainInfo.chainId,
					prefetching: true,
					suggestChain: true,
				};
			}),
		});

		//	other stores
		this.layoutStore = new LayoutStore();
	}
}

export function createRootStore() {
	return new RootStore();
}
