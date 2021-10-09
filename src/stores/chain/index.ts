import { computed, makeObservable, observable } from 'mobx';

import { ChainStore as BaseChainStore } from '@keplr-wallet/stores';

import { ChainInfo } from '@keplr-wallet/types';

export interface ChainInfoWithExplorer extends ChainInfo {
	// Formed as "https://explorer.com/{txHash}"
	explorerUrlToTx: string;
}

export class ChainStore extends BaseChainStore<ChainInfoWithExplorer> {
	@observable
	protected readonly osmosisChainId: string;

	constructor(embedChainInfos: ChainInfoWithExplorer[], osmosisChainId: string) {
		super(embedChainInfos);

		this.osmosisChainId = osmosisChainId;

		makeObservable(this);
	}

	@computed
	get current(): ChainInfoWithExplorer {
		if (this.hasChain(this.osmosisChainId)) {
			return this.getChain(this.osmosisChainId).raw;
		}

		throw new Error('osmosis chain not set');
	}

	@computed
	get currentFluent() {
		if (this.hasChain(this.osmosisChainId)) {
			return this.getChain(this.osmosisChainId);
		}

		throw new Error('osmosis chain not set');
	}
}
