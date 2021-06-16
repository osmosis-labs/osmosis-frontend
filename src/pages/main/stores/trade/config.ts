import { AmountConfig } from '@keplr-wallet/hooks';
import { ChainGetter } from '@keplr-wallet/stores';
import { ObservableQueryBalances } from '@keplr-wallet/stores/build/query/balances';
import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from '@keplr-wallet/unit';
import { action, computed, makeObservable, observable, override } from 'mobx';
import { computedFn } from 'mobx-utils';
import { ObservableQueryPools } from '../../../../stores/osmosis/query/pools';
import { GammSwapManager } from '../../../../stores/osmosis/swap';
import { SlippageStep } from '../../models/tradeModels';
import { slippageStepToPercentage } from '../../utils/slippageStepToPercentage';

// CONTRACT: Use with `observer`
export class TradeConfig extends AmountConfig {
	@observable.ref
	protected _queryPools: ObservableQueryPools;

	@observable
	protected inCurrencyMinimalDenom: string = '';
	@observable
	protected outCurrencyMinimalDenom: string = '';

	@observable
	protected _slippageStep: SlippageStep | undefined = SlippageStep.Step3;

	readonly initialManualSlippage = '0.05';
	// If slippage step is undefiend,
	// the slippage can be set manually.
	@observable
	protected _slippage: string = this.initialManualSlippage;

	constructor(
		chainGetter: ChainGetter,
		initialChainId: string,
		sender: string,
		queryBalances: ObservableQueryBalances,
		protected swapManager: GammSwapManager,
		queryPools: ObservableQueryPools
	) {
		super(chainGetter, initialChainId, sender, undefined, queryBalances);

		this._queryPools = queryPools;

		makeObservable(this);
	}

	@action
	setQueryPools(queryPools: ObservableQueryPools) {
		this._queryPools = queryPools;
	}

	get queryPools(): ObservableQueryPools {
		return this._queryPools;
	}

	/**
	 * Swap manager에 등록된 currency를 반환한다.
	 * 하지만 Chain info에 등록된 Currency를 우선한다.
	 * 추가로 IBC Currency일 경우 coin denom을 원래의 currency의 coin denom으로 바꾼다.
	 */
	get sendableCurrencies(): AppCurrency[] {
		const chainInfo = this.chainInfo;
		return this.swapManager.swappableCurrencies.map(cur => {
			const registeredCurrency = chainInfo.currencies.find(_cur => _cur.coinMinimalDenom === cur.coinMinimalDenom);
			if (registeredCurrency) {
				if ('originCurrency' in registeredCurrency && registeredCurrency.originCurrency) {
					return {
						...registeredCurrency,
						...{
							coinDenom: registeredCurrency.originCurrency.coinDenom,
						},
					};
				}

				return registeredCurrency;
			}
			return cur;
		});
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

	@action
	setSlippageStep(step: SlippageStep | undefined) {
		this._slippageStep = step;
	}

	get slippageStep(): SlippageStep | undefined {
		return this._slippageStep;
	}

	@action
	setSlippage(slippage: string) {
		slippage = slippage.replace(/[^.\d]/g, '');
		if (slippage.startsWith('.')) {
			slippage = '0' + slippage;
		}

		this._slippageStep = undefined;
		this._slippage = slippage;
	}

	@computed
	get slippage(): string {
		if (this.slippageStep != null) {
			return slippageStepToPercentage(this.slippageStep).toString();
		}

		return this._slippage;
	}

	get manualSlippageText(): string {
		return this._slippage;
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
	get spotPrice(): IntPretty {
		const computed = this.swapManager.computeOptimizedRoues(
			this.queryPools,
			this.sendCurrency.coinMinimalDenom,
			this.outCurrency.coinMinimalDenom
		);

		if (!computed) {
			return new IntPretty(new Int(0));
		}

		return computed.spotPrice;
	}

	@computed
	get spotPriceWithoutSwapFee(): IntPretty {
		const computed = this.swapManager.computeOptimizedRoues(
			this.queryPools,
			this.sendCurrency.coinMinimalDenom,
			this.outCurrency.coinMinimalDenom
		);

		if (!computed) {
			return new IntPretty(new Int(0));
		}

		return computed.spotPriceWithoutSwapFee;
	}

	@computed
	get swapFee(): IntPretty {
		const computed = this.swapManager.computeOptimizedRoues(
			this.queryPools,
			this.sendCurrency.coinMinimalDenom,
			this.outCurrency.coinMinimalDenom
		);

		if (!computed) {
			return new IntPretty(new Int(0));
		}

		return computed.swapFee;
	}

	@computed
	get poolId(): string | undefined {
		const computed = this.swapManager.computeOptimizedRoues(
			this.queryPools,
			this.sendCurrency.coinMinimalDenom,
			this.outCurrency.coinMinimalDenom
		);

		if (!computed) {
			return undefined;
		}

		return computed.poolId;
	}

	@computed
	get outAmount(): CoinPretty {
		const inAmount = this.amount;
		try {
			if (!inAmount || new Dec(inAmount).lte(new Dec(0))) {
				return new CoinPretty(
					this.outCurrency,
					new Dec('0').mul(DecUtils.getPrecisionDec(this.outCurrency.coinDecimals))
				);
			}
		} catch {
			return new CoinPretty(
				this.outCurrency,
				new Dec('0').mul(DecUtils.getPrecisionDec(this.outCurrency.coinDecimals))
			);
		}

		const spotPrice = this.spotPriceWithoutSwapFee;

		return new CoinPretty(
			this.outCurrency,
			new Dec(inAmount)
				.mul(new Dec(1).quo(spotPrice.toDec()))
				.mul(DecUtils.getPrecisionDec(this.outCurrency.coinDecimals))
				.truncate()
		);
	}

	readonly getErrorOfSlippage = computedFn(() => {
		const slippage = this.slippage;
		if (!slippage) {
			return new Error('Slippage not set');
		}

		try {
			const dec = new Dec(slippage);
			if (dec.lt(new Dec(0))) {
				return new Error('Slippage should be positive');
			}
		} catch {
			return new Error('Invalid slippage number');
		}
	});

	getError(): Error | undefined {
		const error = super.getError();
		if (error) {
			return error;
		}

		return this.getErrorOfSlippage();
	}
}
