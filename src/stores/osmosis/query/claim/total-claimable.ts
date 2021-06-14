import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap } from '@keplr-wallet/stores';
import { TotalClaimable } from './types';
import { KVStore } from '@keplr-wallet/common';
import { computed, makeObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { CoinPretty, Dec } from '@keplr-wallet/unit';

export class ObservableQueryTotalClaimableInner extends ObservableChainQuery<TotalClaimable> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, protected readonly bech32Address: string) {
		super(kvStore, chainId, chainGetter, `/osmosis/claim/v1beta1/total_claimable/${bech32Address}`);

		makeObservable(this);
	}

	// Key: denom, Value: amount
	@computed
	protected get coinsMap(): Map<string, string> {
		const map = new Map<string, string>();

		if (this.response) {
			for (const coin of this.response.data.coins) {
				map.set(coin.denom, coin.amount);
			}
		}

		return map;
	}

	readonly amountOf = computedFn(
		(minimalDenom: string): CoinPretty => {
			const chainInfo = this.chainGetter.getChain(this.chainId);
			const currency = chainInfo.findCurrency(minimalDenom);
			if (!currency) {
				throw new Error('Unknown currency');
			}

			let amount = '0';
			if (this.coinsMap.has(minimalDenom)) {
				amount = this.coinsMap.get(minimalDenom)!;
			}

			return new CoinPretty(currency, new Dec(amount));
		}
	);
}

export class ObservableQueryTotalCliamable extends ObservableChainQueryMap<TotalClaimable> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter, (bech32Address: string) => {
			return new ObservableQueryTotalClaimableInner(this.kvStore, this.chainId, this.chainGetter, bech32Address);
		});
	}

	get(bech32Address: string): ObservableQueryTotalClaimableInner {
		return super.get(bech32Address) as ObservableQueryTotalClaimableInner;
	}
}
