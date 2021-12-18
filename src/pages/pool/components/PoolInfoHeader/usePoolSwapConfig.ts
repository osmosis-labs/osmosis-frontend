import { AmountConfig } from '@keplr-wallet/hooks';
import { ChainGetter } from '@keplr-wallet/stores';
import { ObservableQueryBalances } from '@keplr-wallet/stores/build/query/balances';
import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty, Dec, Int, IntPretty } from '@keplr-wallet/unit';
import { action, computed, makeObservable, observable, override } from 'mobx';
import { useState } from 'react';
import { ObservableQueryPools } from 'src/stores/osmosis/query/pools';

export class PoolSwapConfig extends AmountConfig {
	@observable.ref
	protected _queryPools: ObservableQueryPools;

	@observable
	protected inCurrencyMinimalDenom: string = '';
	@observable
	protected outCurrencyMinimalDenom: string = '';

	/**
	 * Multiply balance when getting amount.
	 * If the ratio is 1, it is handled as the `isMax` turned on.
	 * Ratio should be <= 1 and > 0.
	 */
	@observable
	protected _ratio: number | undefined = undefined;

	/**
	 * By default, the order of currency follows the order of pool assets in the pool.
	 * And the basic assumption is to buy the second currency with the first currency.
	 * However, in the case of a pool such as LBP,
	 * it may be given priority to have users buy a specific denom.
	 * The denom set in this field is set as the second currency.
	 * @protected
	 */
	@observable
	protected _userBuyPrioritaryDenom: string | undefined = undefined;

	constructor(
		chainGetter: ChainGetter,
		initialChainId: string,
		sender: string,
		queryBalances: ObservableQueryBalances,
		poolId: string,
		queryPools: ObservableQueryPools
	) {
		super(chainGetter, initialChainId, sender, undefined, queryBalances);

		this._poolId = poolId;
		this._queryPools = queryPools;

		makeObservable(this);
	}

	@observable
	protected _poolId: string;

	get poolId(): string {
		return this._poolId;
	}

	get queryPools(): ObservableQueryPools {
		return this._queryPools;
	}

	get pool() {
		return this.queryPools.getObservableQueryPool(this.poolId);
	}

	@action
	setUserBuyPrioritaryDenom(denom: string | undefined) {
		this._userBuyPrioritaryDenom = denom;
	}

	get userBuyPrioritaryDenom(): string | undefined {
		return this._userBuyPrioritaryDenom;
	}

	@computed
	get sendableCurrencies(): AppCurrency[] {
		const pool = this.pool.pool;
		if (!pool) {
			return [];
		}

		const currencies = pool.poolAssets.map(asset => asset.amount.currency);

		if (this.userBuyPrioritaryDenom) {
			const buyPrioritaryCurrencyIndex = currencies.findIndex(
				cur => cur.coinMinimalDenom === this.userBuyPrioritaryDenom
			);
			if (buyPrioritaryCurrencyIndex >= 0 && currencies.length >= 2) {
				const buyPrioritaryCurrency = currencies[buyPrioritaryCurrencyIndex];
				currencies.splice(buyPrioritaryCurrencyIndex, 1);
				currencies.splice(1, 0, buyPrioritaryCurrency);
			}
		}

		return currencies;
	}

	get ratio(): number | undefined {
		return this._ratio;
	}

	@action
	setRatio(ratio: number | undefined) {
		if (ratio != null) {
			if (ratio > 1) {
				console.log('Warning: amount ratio should be lesser than or equal to 1');
				return;
			}

			if (ratio <= 0) {
				console.log('Warning: amount ratio should be greater than 0');
				return;
			}
		}

		this._ratio = ratio;
	}

	@override
	get sendCurrency(): AppCurrency {
		if (this.inCurrencyMinimalDenom) {
			const find = this.sendableCurrencies.find(cur => cur.coinMinimalDenom === this.inCurrencyMinimalDenom);
			if (find) {
				return find;
			}
		}

		return this.sendableCurrencies[0];
	}

	@override
	get amount(): string {
		if (this.ratio != null) {
			const balance = this.queryBalances
				.getQueryBech32Address(this.sender)
				.getBalanceFromCurrency(this.sendCurrency)
				.mul(new Dec(this.ratio.toString()));

			const result = this.feeConfig?.fee ? balance.sub(this.feeConfig.fee) : balance;
			if (result.toDec().lte(new Dec(0))) {
				return '0';
			}

			// Remember that the `CoinPretty`'s sub method do nothing if the currencies are different.
			return result
				.trim(true)
				.locale(false)
				.hideDenom(true)
				.toString();
		}

		return this._amount;
	}

	@override
	setAmount(amount: string) {
		this.setRatio(undefined);
		super.setAmount(amount);
	}

	get isMax(): boolean {
		return this._ratio === 1;
	}

	@override
	setIsMax(isMax: boolean): void {
		if (isMax) {
			this.setRatio(1);
		} else {
			this.setRatio(undefined);
		}
	}

	@override
	toggleIsMax(): void {
		this.setIsMax(!this.isMax);
	}

	@computed
	get outCurrency(): AppCurrency {
		if (this.outCurrencyMinimalDenom) {
			const find = this.sendableCurrencies.find(cur => cur.coinMinimalDenom === this.outCurrencyMinimalDenom);
			if (find) {
				return find;
			}
		}

		return this.sendableCurrencies[1];
	}

	@computed
	get outAmount(): CoinPretty {
		const pool = this.pool.pool;
		if (!pool) {
			return new CoinPretty(this.outCurrency, new Dec(0));
		}

		if (this.getError() != null) {
			return new CoinPretty(this.outCurrency, new Dec(0));
		}

		try {
			const estimated = pool.estimateSwapExactAmountIn(
				{
					currency: this.sendCurrency,
					amount: this.amount,
				},
				this.outCurrency
			);

			return estimated.tokenOut;
		} catch {
			return new CoinPretty(this.outCurrency, new Dec(0));
		}
	}

	@computed
	get spotPriceWithoutSwapFee(): IntPretty {
		const pool = this.pool.pool;

		if (!pool) {
			return new IntPretty(new Int(0));
		}

		return pool.calculateSpotPriceWithoutSwapFee(this.sendCurrency.coinMinimalDenom, this.outCurrency.coinMinimalDenom);
	}

	@computed
	get swapFee(): IntPretty {
		const pool = this.pool.pool;
		if (!pool) {
			return new IntPretty(new Int(0));
		}

		return pool.swapFee;
	}

	@computed
	get estimatedSlippage(): IntPretty {
		const pool = this.pool.pool;
		if (!pool) {
			return new IntPretty(new Int(0));
		}

		if (this.getError() != null) {
			return new IntPretty(new Int(0));
		}

		try {
			const estimated = pool.estimateSwapExactAmountIn(
				{
					currency: this.sendCurrency,
					amount: this.amount,
				},
				this.outCurrency
			);

			return estimated.slippage;
		} catch {
			return new IntPretty(new Int(0));
		}
	}

	@action
	setPoolId(poolId: string) {
		this._poolId = poolId;
	}

	@action
	setQueryPools(queryPools: ObservableQueryPools) {
		this._queryPools = queryPools;
	}

	@action
	setInCurrency(minimalDenom: string) {
		this.inCurrencyMinimalDenom = minimalDenom;
	}

	@action
	setOutCurrency(minimalDenom: string) {
		this.outCurrencyMinimalDenom = minimalDenom;
	}

	@action
	switchInAndOut() {
		const inCurrency = this.sendCurrency;
		const outCurrency = this.outCurrency;

		const outAmount = this.outAmount;

		this.setIsMax(false);

		this.setInCurrency(outCurrency.coinMinimalDenom);
		this.setOutCurrency(inCurrency.coinMinimalDenom);

		this.setAmount(
			outAmount
				.trim(true)
				.maxDecimals(6)
				.shrink(true)
				.hideDenom(true)
				.locale(false)
				.toString()
		);
	}
}

export const usePoolSwapConfig = (
	chainGetter: ChainGetter,
	chainId: string,
	sender: string,
	queryBalances: ObservableQueryBalances,
	poolId: string,
	queryPools: ObservableQueryPools
) => {
	const [config] = useState(() => new PoolSwapConfig(chainGetter, chainId, sender, queryBalances, poolId, queryPools));
	config.setChain(chainId);
	config.setSender(sender);
	config.setQueryBalances(queryBalances);
	config.setPoolId(poolId);
	config.setQueryPools(queryPools);

	return config;
};
