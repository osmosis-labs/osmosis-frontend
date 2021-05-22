// TODO: Keplr 본체에서 import path 수정하기
import { ObservableQueryBalances } from '@keplr-wallet/stores/build/query/balances';
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from '@keplr-wallet/unit';
import { AppCurrency, Currency } from '@keplr-wallet/types';
import { ObservableQueryPools } from '../pools';
import { computedFn } from 'mobx-utils';
import {
	ObservableQueryAccountLockedCoins,
	ObservableQueryAccountUnlockableCoins,
	ObservableQueryAccountUnlockingCoins,
} from '../lockup';

export class ObservableQueryGammPoolShare {
	constructor(
		protected readonly queryPools: ObservableQueryPools,
		protected readonly queryBalances: ObservableQueryBalances,
		protected readonly queryLockedCoins: ObservableQueryAccountLockedCoins,
		protected readonly queryUnlockingCoins: ObservableQueryAccountUnlockingCoins,
		protected readonly queryUnlockableCoins: ObservableQueryAccountUnlockableCoins
	) {}

	/**
	 * 특정 주소가 소유하고 있는 모든 share들의 pool id 배열을 반환한다.
	 */
	readonly getOwnPools = computedFn((bech32Address: string): string[] => {
		const balances: {
			currency: AppCurrency;
		}[] = this.queryBalances.getQueryBech32Address(bech32Address).positiveBalances;
		const locked = this.queryLockedCoins.get(bech32Address).lockedCoins;
		const unlocking = this.queryUnlockingCoins.get(bech32Address).unlockingCoins;
		const unlockable = this.queryUnlockableCoins.get(bech32Address).unlockableCoins;

		let result: string[] = [];

		for (const bal of balances
			.concat(locked)
			.concat(unlocking)
			.concat(unlockable)) {
			// Pool share 토큰은 `gamm/pool/${poolId}` 형태이다.
			if (bal.currency.coinMinimalDenom.startsWith('gamm/pool/')) {
				result.push(bal.currency.coinMinimalDenom.replace('gamm/pool/', ''));
			}
		}

		// Remove the duplicates.
		result = [...new Set(result)];

		result.sort((e1, e2) => {
			return parseInt(e1) >= parseInt(e2) ? 1 : -1;
		});

		return result;
	});

	readonly getShareCurrency = computedFn(
		(poolId: string): Currency => {
			return {
				coinDenom: `GAMM/${poolId}`,
				coinMinimalDenom: `gamm/pool/${poolId}`,
				coinDecimals: 18,
			};
		}
	);

	readonly getLockedGammShare = computedFn(
		(bech32Address: string, poolId: string): CoinPretty => {
			const currency = this.getShareCurrency(poolId);

			const locked = this.queryLockedCoins
				.get(bech32Address)
				.lockedCoins.find(coin => coin.currency.coinMinimalDenom === currency.coinMinimalDenom);
			if (locked) {
				return locked;
			}
			return new CoinPretty(currency, new Dec(0));
		}
	);

	readonly getUnlockingGammShare = computedFn(
		(bech32Address: string, poolId: string): CoinPretty => {
			const currency = this.getShareCurrency(poolId);

			const locked = this.queryUnlockingCoins
				.get(bech32Address)
				.unlockingCoins.find(coin => coin.currency.coinMinimalDenom === currency.coinMinimalDenom);
			if (locked) {
				return locked;
			}
			return new CoinPretty(currency, new Dec(0));
		}
	);

	readonly getUnlockableGammShare = computedFn(
		(bech32Address: string, poolId: string): CoinPretty => {
			const currency = this.getShareCurrency(poolId);

			const locked = this.queryUnlockableCoins
				.get(bech32Address)
				.unlockableCoins.find(coin => coin.currency.coinMinimalDenom === currency.coinMinimalDenom);
			if (locked) {
				return locked;
			}
			return new CoinPretty(currency, new Dec(0));
		}
	);

	readonly getAvailableGammShare = computedFn(
		(bech32Address: string, poolId: string): CoinPretty => {
			const currency = this.getShareCurrency(poolId);

			return this.queryBalances.getQueryBech32Address(bech32Address).getBalanceFromCurrency(currency);
		}
	);

	/**
	 * locked, unlocking, unlockable인 share도 포함한다.
	 * @param bech32Address
	 * @param poolId
	 */
	readonly getAllGammShare = computedFn(
		(bech32Address: string, poolId: string): CoinPretty => {
			const available = this.getAvailableGammShare(bech32Address, poolId);
			const locked = this.getLockedGammShare(bech32Address, poolId);
			const unlocking = this.getUnlockingGammShare(bech32Address, poolId);
			const unlockable = this.getUnlockableGammShare(bech32Address, poolId);

			return available
				.add(locked)
				.add(unlocking)
				.add(unlockable);
		}
	);

	readonly getAllGammShareRatio = computedFn(
		(bech32Address: string, poolId: string): IntPretty => {
			const pool = this.queryPools.getPool(poolId);
			if (!pool) {
				return new IntPretty(new Int(0)).ready(false);
			}

			const share = this.getAllGammShare(bech32Address, poolId);

			const totalShare = pool.totalShare;

			// 백분률로 만들어주기 위해서 마지막에 10^2를 곱한다
			return new IntPretty(share.quo(totalShare).mul(DecUtils.getPrecisionDec(2))).maxDecimals(2).trim(true);
		}
	);
}
