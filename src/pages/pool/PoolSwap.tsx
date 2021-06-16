import React, { FunctionComponent, useState } from 'react';
import { AmountConfig } from '@keplr-wallet/hooks';
import { ChainGetter } from '@keplr-wallet/stores';
import { ObservableQueryBalances } from '@keplr-wallet/stores/build/query/balances';
import { action, computed, makeObservable, observable, override } from 'mobx';
import { ObservableQueryPools } from '../../stores/osmosis/query/pools';
import { AppCurrency } from '@keplr-wallet/types';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useFakeFeeConfig } from '../../hooks/tx';
import { FromBox } from '../main/components/FormBox';
import { ToBox } from '../main/components/ToBox';
import { CoinPretty, Dec, Int, IntPretty } from '@keplr-wallet/unit';
import { Img } from '../../components/common/Img';
import { TToastType, useToast } from '../../components/common/toasts';
import { Container } from '../../components/containers';
import { TCardTypes } from '../../interfaces';

export class PoolSwapConfig extends AmountConfig {
	@observable
	protected _poolId: string;

	@observable.ref
	protected _queryPools: ObservableQueryPools;

	@observable
	protected inCurrencyMinimalDenom: string = '';
	@observable
	protected outCurrencyMinimalDenom: string = '';

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

	get pool() {
		return this.queryPools.getObservableQueryPool(this.poolId);
	}

	@action
	setPoolId(poolId: string) {
		this._poolId = poolId;
	}

	get poolId(): string {
		return this._poolId;
	}

	@action
	setQueryPools(queryPools: ObservableQueryPools) {
		this._queryPools = queryPools;
	}

	get queryPools(): ObservableQueryPools {
		return this._queryPools;
	}

	get sendableCurrencies(): AppCurrency[] {
		const pool = this.pool.pool;
		if (!pool) {
			return [];
		}

		return pool.poolAssets.map(asset => asset.amount.currency);
	}

	@action
	setInCurrency(minimalDenom: string) {
		this.inCurrencyMinimalDenom = minimalDenom;
	}

	@action
	setOutCurrency(minimalDenom: string) {
		this.outCurrencyMinimalDenom = minimalDenom;
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

export const PoolSwap: FunctionComponent<{
	poolId: string;
}> = observer(({ poolId }) => {
	const { chainStore, queriesStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const config = usePoolSwapConfig(
		chainStore,
		chainStore.current.chainId,
		account.bech32Address,
		queries.queryBalances,
		poolId,
		queries.osmosis.queryGammPools
	);
	const feeConfig = useFakeFeeConfig(chainStore, chainStore.current.chainId, account.msgOpts.swapExactAmountIn.gas);
	config.setFeeConfig(feeConfig);

	return (
		<section className="pb-10 max-w-max mx-auto">
			<h5 className="mb-7.5 ">Purchase Tokens</h5>
			<div
				className="w-5/12 h-full rounded-xl bg-card py-6 px-7.5"
				style={{
					minWidth: '500px',
				}}>
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
				<SwapButton config={config} />
			</div>
		</section>
	);
});

const SwapButton: FunctionComponent<{
	config: PoolSwapConfig;
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
							config.estimatedSlippage.mul(new Dec('1.1')).toString(),
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

								// Refresh the pool after swap
								config.pool.fetch();
							}
						);

						toast.displayToast(TToastType.TX_BROADCASTING);
					} catch (e) {
						toast.displayToast(TToastType.TX_FAILED, { message: e.message });
					}
				}
			}}
			className="bg-primary-200 h-15 flex justify-center items-center w-full rounded-2xl shadow-elevation-04dp hover:opacity-75 disabled:opacity-50"
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
				<p className="font-body tracking-wide">Purchase</p>
			)}
		</button>
	);
});

const FeesBox: FunctionComponent<{
	config: PoolSwapConfig;
}> = observer(({ config }) => {
	const outSpotPrice = config.spotPriceWithoutSwapFee;
	const inSpotPrice = outSpotPrice.toDec().equals(new Dec(0))
		? outSpotPrice
		: new IntPretty(new Dec(1).quo(outSpotPrice.toDec()));

	return (
		<Container className="rounded-lg py-3 px-4.5 w-full border border-white-faint mb-4.5" type={TCardTypes.CARD}>
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
				<div className="grid grid-cols-2">
					<p className="text-sm text-wireframes-lightGrey">Estimated Slippage</p>
					<p className="col-span-1 text-sm text-wireframes-lightGrey text-right truncate">
						{`${config.estimatedSlippage
							.trim(true)
							.maxDecimals(3)
							.toString()}%`}
					</p>
				</div>
			</section>
		</Container>
	);
});
