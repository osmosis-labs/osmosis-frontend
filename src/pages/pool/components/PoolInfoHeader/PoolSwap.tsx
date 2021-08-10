import styled from '@emotion/styled';
import { AmountConfig } from '@keplr-wallet/hooks';
import { ChainGetter } from '@keplr-wallet/stores';
import { ObservableQueryBalances } from '@keplr-wallet/stores/build/query/balances';
import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty, Dec, Int, IntPretty } from '@keplr-wallet/unit';
import { action, computed, makeObservable, observable, override } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useState } from 'react';
import { TToastType, useToast } from 'src/components/common/toasts';
import { ConnectAccountButton } from 'src/components/ConnectAccountButton';
import { Container } from 'src/components/containers';
import { TitleText } from 'src/components/Texts';
import { wrapBaseDialog } from 'src/dialogs';
import { colorPrimary } from 'src/emotionStyles/colors';
import { useAccountConnection } from 'src/hooks/account/useAccountConnection';
import { useFakeFeeConfig } from 'src/hooks/tx';
import { TCardTypes } from 'src/interfaces';
import { FromBox } from 'src/pages/main/components/FormBox';
import { ToBox } from 'src/pages/main/components/ToBox';
import { SwapDirectionButton } from 'src/components/SwapToken/SwapDirectionButton';
import { useStore } from 'src/stores';
import { ObservableQueryPools } from 'src/stores/osmosis/query/pools';
import { isSlippageError } from 'src/utils/tx';

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

		return pool.poolAssets
			.map(asset => asset.amount.currency)
			.sort((asset1, asset2) => {
				// XXX: For some marketing reasons..., just sort the currencies to locate the regen token to the end.
				//      (Initially, no users have the regen token, so anyone can sell the regen.)
				if (asset1.coinMinimalDenom === 'ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076') {
					return 1;
				}
				if (asset2.coinMinimalDenom === 'ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076') {
					return -1;
				}
				return 0;
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

	@override
	setAmount(amount: string) {
		this.setIsMax(false);
		super.setAmount(amount);
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

interface PoolSwapDialogProps {
	poolId: string;
	close: () => void;
}

export const PoolSwapDialog = wrapBaseDialog(
	observer(function PoolSwapDialog({ poolId, close }: PoolSwapDialogProps) {
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
			// TODO: Remove text-white-high class after refactoring FromBox, ToBox, etc
			<PoolSwapDialogContainer className="text-white-high">
				<TitleText pb={30}>Swap Tokens</TitleText>
				<PoolSwapDialogContent>
					<PairContainer>
						<div style={{ marginBottom: 18 }}>
							<FromBox config={config} />
						</div>
						<SwapDirectionButton
							onClick={e => {
								e.preventDefault();
								config.switchInAndOut();
							}}
						/>
						<div style={{ marginBottom: 18 }}>
							<ToBox config={config} />
						</div>
					</PairContainer>

					<FeesBox config={config} />

					<SwapButton config={config} close={close} />
				</PoolSwapDialogContent>
			</PoolSwapDialogContainer>
		);
	})
);

const PoolSwapDialogContainer = styled.section`
	width: 100%;
	margin-left: auto;
	margin-right: auto;
`;

const PoolSwapDialogContent = styled.div`
	border-radius: 0.75rem;
	background-color: ${colorPrimary};
	padding: 24px 30px;
`;

const PairContainer = styled.div`
	position: relative;
`;

const SwapButton: FunctionComponent<{
	config: PoolSwapConfig;
	close: () => void;
}> = observer(({ config, close }) => {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);

	const { isAccountConnected, connectAccount } = useAccountConnection();
	const toast = useToast();

	if (!isAccountConnected) {
		return (
			<ConnectAccountButton
				className="h-15"
				onClick={e => {
					e.preventDefault();
					connectAccount();
				}}
			/>
		);
	}

	return (
		<button
			onClick={async e => {
				e.preventDefault();

				let slippage = config.estimatedSlippage.mul(new Dec('1.05'));
				if (slippage.toDec().lt(new Dec(1))) {
					slippage = new IntPretty(new Dec(1));
				}

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
							slippage
								.locale(false)
								.maxDecimals(18)
								.toString(),
							'',
							tx => {
								if (tx.code) {
									toast.displayToast(TToastType.TX_FAILED, {
										message: isSlippageError(tx)
											? 'Swap failed. Liquidity may not be sufficient. Try adjusting the allowed slippage.'
											: tx.log,
									});
								} else {
									toast.displayToast(TToastType.TX_SUCCESSFULL, {
										customLink: chainStore.current.explorerUrlToTx.replace('{txHash}', tx.hash.toUpperCase()),
									});

									config.setAmount('');
									close();
								}
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
				<p className="font-body tracking-wide">Swap</p>
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
				<hr className="w-full my-4" />
				<div className="grid grid-cols-2">
					<p className="text-sm font-bold text-white-high">Estimated Slippage</p>
					<p className="col-span-1 text-sm font-bold text-white-high text-right truncate">
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
