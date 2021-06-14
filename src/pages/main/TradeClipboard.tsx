import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { Container } from '../../components/containers';
import { TCardTypes } from '../../interfaces';
import { DisplayAmount } from '../../components/common/DIsplayAmount';
import { Img } from '../../components/common/Img';
import cn from 'clsx';
import { TokenListDisplay } from '../../components/common/TokenListDisplay';
import { TokenDisplay } from '../../components/common/TokenDisplay';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { action, computed, makeObservable, observable, override } from 'mobx';
import { AppCurrency, Currency } from '@keplr-wallet/types';
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { GammSwapManager } from '../../stores/osmosis/swap';
import { ObservableQueryPools } from '../../stores/osmosis/query/pools';
import { TradeTxSettings } from './TradeTxSettings';
import { ChainGetter, ObservableQueryBalances } from '@keplr-wallet/stores';
import { AmountConfig } from '@keplr-wallet/hooks';
import { TToastType, useToast } from '../../components/common/toasts';
import { useFakeFeeConfig } from '../../hooks/tx';
import { computedFn } from 'mobx-utils';

export enum SlippageStep {
	Step1, // 0.1%
	Step2, // 0.5%
	Step3, // 1.0%
}

export function slippageStepToPercentage(step: SlippageStep) {
	switch (step) {
		case SlippageStep.Step1:
			return 0.1;
		case SlippageStep.Step2:
			return 0.5;
		case SlippageStep.Step3:
			return 1;
	}
}

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

	// If slippage step is undefiend,
	// the slippage can be set by manually.
	@observable
	protected _slippage: string = '0.05';

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

export const useTradeConfig = (
	chainGetter: ChainGetter,
	chainId: string,
	sender: string,
	queryBalances: ObservableQueryBalances,
	swapManager: GammSwapManager,
	queryPools: ObservableQueryPools
) => {
	const [config] = useState(
		() => new TradeConfig(chainGetter, chainId, sender, queryBalances, swapManager, queryPools)
	);
	config.setChain(chainId);
	config.setSender(sender);
	config.setQueryBalances(queryBalances);
	config.setQueryPools(queryPools);

	return config;
};

export const TradeClipboard: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, accountStore, swapManager } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const config = useTradeConfig(
		chainStore,
		chainStore.current.chainId,
		account.bech32Address,
		queries.queryBalances,
		swapManager,
		queries.osmosis.queryGammPools
	);
	const feeConfig = useFakeFeeConfig(chainStore, chainStore.current.chainId, account.msgOpts.swapExactAmountIn.gas);
	config.setFeeConfig(feeConfig);

	return (
		<Container
			overlayClasses=""
			type={TCardTypes.CARD}
			className="w-full h-full shadow-elevation-24dp rounded-2xl relative border-2 border-cardInner">
			<ClipboardClip />
			<div className="p-2.5 h-full w-full">
				<div className="bg-cardInner rounded-md w-full h-full p-5">
					<TradeTxSettings config={config} />
					<section className="mt-5 w-full mb-12.5">
						<div className="relative">
							<div className="mb-4.5">
								<FromBox config={config} />
							</div>
							<div className="mb-4.5">
								<ToBox config={config} />
							</div>
							<button
								className="s-position-abs-center w-12 h-12 z-0"
								onClick={e => {
									e.preventDefault();

									config.switchInAndOut();
								}}>
								<Img className="w-12 h-12" src="/public/assets/sidebar/icon-border_unselected.svg" />
								<Img className="s-position-abs-center w-6 h-6" src="/public/assets/Icons/Switch.svg" />
							</button>
						</div>
						<FeesBox config={config} />
					</section>
					<section className="w-full">
						<SwapButton config={config} />
					</section>
				</div>
			</div>
		</Container>
	);
});

const SwapButton: FunctionComponent<{
	config: TradeConfig;
}> = observer(({ config }) => {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);

	const toast = useToast();

	return (
		<button
			onClick={async e => {
				e.preventDefault();

				if (account.isReadyToSendMsgs) {
					const poolId = config.poolId;
					if (!poolId) {
						throw new Error("Can't calculate the optimized pools");
					}

					try {
						await account.osmosis.sendSwapExactAmountInMsg(
							poolId,
							{
								currency: config.sendCurrency,
								amount: config.amount,
							},
							config.outCurrency,
							config.slippage,
							'',
							tx => {
								if (tx.code) {
									toast.displayToast(TToastType.TX_FAILED, { message: tx.log });
								} else {
									toast.displayToast(TToastType.TX_SUCCESSFULL, {
										customLink: chainStore.current.explorerUrlToTx!.replace('{txHash}', tx.hash),
									});

									config.setAmount('');
								}
							}
						);

						toast.displayToast(TToastType.TX_BROADCASTING);
					} catch (e) {
						toast.displayToast(TToastType.TX_FAILED, { message: e.message });
					}
				}
			}}
			className="bg-primary-200 h-15 flex justify-center items-center w-full rounded-lg shadow-elevation-04dp hover:opacity-75 disabled:opacity-50"
			disabled={!account.isReadyToSendMsgs || config.getError() != null}>
			{account.isSendingMsg === 'swapExactAmountIn' ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
					viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
					<path
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						className="opacity-75"
					/>
				</svg>
			) : (
				<p className="font-body tracking-wide">SWAP</p>
			)}
		</button>
	);
});

const FeesBox: FunctionComponent<{
	config: TradeConfig;
}> = observer(({ config }) => {
	const outSpotPrice = config.spotPriceWithoutSwapFee;
	const inSpotPrice = outSpotPrice.toDec().equals(new Dec(0))
		? outSpotPrice
		: new IntPretty(new Dec(1).quo(outSpotPrice.toDec()));

	return (
		<Container className="rounded-lg py-3 px-4.5 w-full border border-white-faint" type={TCardTypes.CARD}>
			<section className="w-full">
				<div className="flex justify-between items-center">
					<p className="text-sm text-wireframes-lightGrey">Rate</p>
					<p className="text-sm text-wireframes-lightGrey">
						<span className="mr-2">1 {config.sendCurrency.coinDenom.toUpperCase()} =</span>{' '}
						{inSpotPrice
							.maxDecimals(3)
							.trim(true)
							.toString()}{' '}
						{config.outCurrency.coinDenom.toUpperCase()}
					</p>
				</div>
				<div className="flex justify-end items-center mt-1.5 mb-2.5">
					<p className="text-xs text-wireframes-grey">
						<span className="mr-2">1 {config.outCurrency.coinDenom.toUpperCase()} =</span>{' '}
						{outSpotPrice
							.maxDecimals(3)
							.trim(true)
							.toString()}{' '}
						{config.sendCurrency.coinDenom.toUpperCase()}
					</p>
				</div>
				<div className="grid grid-cols-5">
					<p className="text-sm text-wireframes-lightGrey">Swap Fee</p>
					<p className="col-span-4 text-sm text-wireframes-lightGrey text-right truncate">
						{`${config.swapFee
							.trim(true)
							.maxDecimals(3)
							.toString()}%`}
					</p>
				</div>
			</section>
		</Container>
	);
});

const FromBox: FunctionComponent<{ config: TradeConfig }> = observer(({ config }) => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const balance = queries.queryBalances
		.getQueryBech32Address(account.bech32Address)
		.balances.find(bal => bal.currency.coinMinimalDenom === config.sendCurrency.coinMinimalDenom);

	const [openSelector, setOpenSelector] = React.useState(false);

	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4 relative">
			<section className="flex justify-between items-center mb-2">
				<p>From</p>
				<div className="flex items-center">
					<div>
						<p className="inline-block text-sm leading-tight w-fit text-xs mr-2">Available</p>
						<DisplayAmount
							wrapperClass="w-fit text-primary-50"
							amount={balance ? balance.balance : new CoinPretty(config.sendCurrency, new Int('0'))}
						/>
					</div>
					<button
						className="rounded-md py-1 px-1.5 bg-white-faint h-6 ml-1.25"
						onClick={e => {
							e.preventDefault();

							config.toggleIsMax();
						}}>
						<p className="text-xs">MAX</p>
					</button>
				</div>
			</section>
			<section className="flex justify-between items-center">
				<TokenDisplay openSelector={openSelector} setOpenSelector={setOpenSelector} currency={config.sendCurrency} />
				<TokenAmountInput
					amount={config.amount}
					currency={config.sendCurrency}
					onInput={text => config.setAmount(text)}
				/>
			</section>
			<div
				style={{ top: 'calc(100% - 16px)' }}
				className={cn('bg-surface rounded-b-2xl z-10 left-0 w-full', openSelector ? 'absolute' : 'hidden')}>
				<TokenListDisplay
					currencies={config.sendableCurrencies.filter(
						cur => cur.coinMinimalDenom !== config.outCurrency.coinMinimalDenom
					)}
					close={() => setOpenSelector(false)}
					onSelect={minimalDenom => config.setInCurrency(minimalDenom)}
				/>
			</div>
		</div>
	);
});

const TokenAmountInput: FunctionComponent<{
	amount: string;
	currency: Currency;
	onInput: (input: string) => void;
}> = observer(({ amount, currency, onInput }) => {
	const { priceStore } = useStore();

	const coinPretty = (() => {
		if (amount) {
			try {
				const result = new CoinPretty(currency, new Dec(amount).mul(DecUtils.getPrecisionDec(currency.coinDecimals)));
				if (result.toDec().gte(new Dec(0))) {
					return result;
				}
			} catch {
				return new CoinPretty(currency, new Dec(0));
			}
		}

		return new CoinPretty(currency, new Dec(0));
	})();

	const price =
		priceStore.calculatePrice('usd', coinPretty) ?? new PricePretty(priceStore.getFiatCurrency('usd')!, new Int(0));

	return (
		<div style={{ maxWidth: '250px' }} className="flex flex-col items-end">
			<input
				type="number"
				style={{ maxWidth: '250px' }}
				onChange={e => onInput(e.currentTarget.value)}
				value={amount}
				placeholder="0"
				className="s-tradebox-input s-number-input-default"
			/>
			<p className="font-body font-semibold text-sm truncate w-full text-right">≈ {price.toString()}</p>
		</div>
	);
});

const ToBox: FunctionComponent<{ config: TradeConfig }> = observer(({ config }) => {
	const [openSelector, setOpenSelector] = React.useState(false);
	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4 relative">
			<section className="flex justify-between items-center mb-2">
				<p>To</p>
			</section>
			<section className="grid grid-cols-2">
				<TokenDisplay setOpenSelector={setOpenSelector} openSelector={openSelector} currency={config.outCurrency} />
				<div className="text-right flex flex-col justify-center h-full">
					<h5
						className={cn('text-xl font-title font-semibold truncate', {
							'opacity-40': config.outAmount.toDec().equals(new Dec(0)),
						})}>
						{config.outAmount
							.trim(true)
							.maxDecimals(6)
							.shrink(true)
							.toString()}
					</h5>
				</div>
			</section>
			<div
				style={{ top: 'calc(100% - 16px)' }}
				className={cn('bg-surface rounded-b-2xl z-10 left-0 w-full', openSelector ? 'absolute' : 'hidden')}>
				<TokenListDisplay
					currencies={config.sendableCurrencies.filter(
						cur => cur.coinMinimalDenom !== config.sendCurrency.coinMinimalDenom
					)}
					close={() => setOpenSelector(false)}
					onSelect={minimalDenom => config.setOutCurrency(minimalDenom)}
				/>
			</div>
		</div>
	);
});

const ClipboardClip: FunctionComponent = () => (
	<div
		style={{
			height: '60px',
			width: '160px',
			left: '50%',
			top: '-8px',
			background: 'linear-gradient(180deg, #3A3369 0%, #231D4B 100%)',
			transform: 'translate(-50%, 0)',
			boxShadow: '0px 2px 2px rgba(11, 16, 38, 0.48)',
		}}
		className="absolute rounded-md overflow-hidden">
		<div
			style={{
				height: '30px',
				width: '48px',
				left: '50%',
				bottom: '7px',
				transform: 'translate(-50%, 0)',
				background: 'rgba(91, 83, 147, 0.12)',
				backgroundBlendMode: 'difference',
			}}
			className="absolute rounded-lg z-10 ">
			<div
				style={{
					height: '30px',
					width: '48px',
					boxShadow: 'inset 1px 1px 1px rgba(0, 0, 0, 0.25)',
				}}
				className="aboslute rounded-md s-position-abs-center"
			/>
		</div>
		<div
			style={{
				height: '20px',
				left: '50%',
				bottom: '0px',
				transform: 'translate(-50%, 0)',
				background: 'linear-gradient(180deg, #332C61 0%, #312A5D 10.94%, #2D2755 100%)',
			}}
			className="z-0 absolute rounded-br-md rounded-bl-md w-full"
		/>
	</div>
);
