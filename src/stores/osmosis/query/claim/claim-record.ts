import { ObservableChainQuery, ObservableChainQueryMap } from '@keplr-wallet/stores/build/query/chain-query';
import { ClaimRecord } from './types';
import { KVStore } from '@keplr-wallet/common';
import { ChainGetter } from '@keplr-wallet/stores/src/common/index';
import { computed, makeObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { CoinPretty, Dec } from '@keplr-wallet/unit';

export class ObservableQueryClaimRecordInner extends ObservableChainQuery<ClaimRecord> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, protected readonly bech32Address: string) {
		super(kvStore, chainId, chainGetter, `/osmosis/claim/v1beta1/claim_record/${bech32Address}`);

		makeObservable(this);
	}

	// Key: denom, Value: amount
	@computed
	protected get initialClaimableAmountMap(): Map<string, string> {
		const map = new Map<string, string>();

		if (this.response) {
			for (const coin of this.response.data.claim_record.initial_claimable_amount) {
				map.set(coin.denom, coin.amount);
			}
		}

		return map;
	}

	readonly initialClaimableAmountOf = computedFn(
		(minimalDenom: string): CoinPretty => {
			const chainInfo = this.chainGetter.getChain(this.chainId);
			const currency = chainInfo.findCurrency(minimalDenom);
			if (!currency) {
				throw new Error('Unknown currency');
			}

			let amount = '0';
			if (this.initialClaimableAmountMap.has(minimalDenom)) {
				amount = this.initialClaimableAmountMap.get(minimalDenom)!;
			}

			return new CoinPretty(currency, new Dec(amount));
		}
	);

	@computed
	get completedActions(): {
		addLiquidity: boolean;
		swap: boolean;
		vote: boolean;
		delegate: boolean;
	} {
		if (!this.response) {
			return {
				addLiquidity: false,
				swap: false,
				vote: false,
				delegate: false,
			};
		}

		return {
			addLiquidity: this.response.data.claim_record.action_completed[0] === true,
			swap: this.response.data.claim_record.action_completed[1] === true,
			vote: this.response.data.claim_record.action_completed[2] === true,
			delegate: this.response.data.claim_record.action_completed[3] === true,
		};
	}
}

export class ObservableQueryClaimRecord extends ObservableChainQueryMap<ClaimRecord> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter, (bech32Address: string) => {
			return new ObservableQueryClaimRecordInner(this.kvStore, this.chainId, this.chainGetter, bech32Address);
		});
	}

	get(bech32Address: string): ObservableQueryClaimRecordInner {
		return super.get(bech32Address) as ObservableQueryClaimRecordInner;
	}
}
