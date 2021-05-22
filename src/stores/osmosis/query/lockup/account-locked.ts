import { ObservableChainQuery, ObservableChainQueryMap } from '@keplr-wallet/stores/build/query/chain-query';
import { KVStore } from '@keplr-wallet/common';
import { ChainGetter } from '@keplr-wallet/stores/src/common/index';
import { AccountLockedLongerDuration } from './types';
import { QueryResponse } from '@keplr-wallet/stores';
import { makeObservable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { Duration } from 'dayjs/plugin/duration';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { AppCurrency } from '@keplr-wallet/types';

export class ObservableQueryAccountLockedInner extends ObservableChainQuery<AccountLockedLongerDuration> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, bech32Address: string) {
		// 좀 트윅한 방식으로 밑의 rest를 duration 설정 없이 이용해서 계정의 모든 lock들을 받아온다.
		super(kvStore, chainId, chainGetter, `/osmosis/lockup/v1beta1/account_locked_longer_duration/${bech32Address}`);

		makeObservable(this);
	}

	protected setResponse(response: Readonly<QueryResponse<AccountLockedLongerDuration>>) {
		super.setResponse(response);

		const chainInfo = this.chainGetter.getChain(this.chainId);
		const unknownCurrencies: string[] = [];
		for (const lock of response.data.locks) {
			unknownCurrencies.push(...lock.coins.map(coin => coin.denom));
		}
		// Remove duplicates.
		chainInfo.addUnknownCurrencies(...[...new Set(unknownCurrencies)]);
	}

	readonly getLockedCoinWithDuration = computedFn(
		(currency: AppCurrency, duration: Duration): CoinPretty => {
			if (!this.response) {
				return new CoinPretty(currency, new Dec(0));
			}

			const matchedLocks = this.response.data.locks
				.filter(lock => {
					return lock.duration === `${duration.asSeconds()}s`;
				})
				.filter(lock => {
					// Filter the unlocking, unlockable locks.
					return new Date(lock.end_time).getMilliseconds() === 0;
				});

			let coin = new CoinPretty(currency, new Dec(0));
			for (const lock of matchedLocks) {
				const matchedCoin = lock.coins.find(coin => coin.denom === currency.coinMinimalDenom);
				if (matchedCoin) {
					coin = coin.add(new CoinPretty(currency, new Dec(matchedCoin.amount)));
				}
			}

			return coin;
		}
	);
}

export class ObservableQueryAccountLocked extends ObservableChainQueryMap<AccountLockedLongerDuration> {
	constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
		super(kvStore, chainId, chainGetter, (bech32Address: string) => {
			return new ObservableQueryAccountLockedInner(this.kvStore, this.chainId, this.chainGetter, bech32Address);
		});
	}

	get(bech32Address: string): ObservableQueryAccountLockedInner {
		return super.get(bech32Address) as ObservableQueryAccountLockedInner;
	}
}
