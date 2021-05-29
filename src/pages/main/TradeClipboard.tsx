import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { Container } from '../../components/containers';
import { TCardTypes } from '../../interfaces';
import { DisplayIcon } from '../../components/layouts/Sidebar/SidebarItem';
import { DisplayAmount } from '../../components/common/DIsplayAmount';
import { Img } from '../../components/common/Img';
import cn from 'clsx';
import { TokenListDisplay } from '../../components/common/TokenListDisplay';
import { TokenDisplay } from '../../components/common/TokenDisplay';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { action, computed, makeObservable, observable } from 'mobx';
import { Currency } from '@keplr-wallet/types';
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { GammSwapManager } from '../../stores/osmosis/swap';
import { ObservableQueryPools } from '../../stores/osmosis/query/pools';
import { AccountWithCosmosAndOsmosis } from '../../stores/osmosis/account';
import { TradeTxSettings } from './TradeTxSettings';
import { ChainStore } from '@keplr-wallet/stores';

// 상태가 좀 복잡한 듯 하니 그냥 mobx로 처리한다...
// CONTRACT: Use with `observer`
export class TradeState {
	@observable
	protected _chainId: string;

	@observable
	protected inCurrencyMinimalDenom: string = '';
	@observable
	protected outCurrencyMinimalDenom: string = '';

	@observable
	protected _inAmount: string = '';

	@observable
	protected _slippage: string = '0.5';

	// TODO: 흠... 생성자 인터페이스가 뭔가 이상해보임.
	constructor(
		protected readonly chainStore: ChainStore,
		chainId: string,
		protected swapManager: GammSwapManager,
		protected account: AccountWithCosmosAndOsmosis,
		protected queryPools: ObservableQueryPools
	) {
		this._chainId = chainId;

		makeObservable(this);
	}

	get chainId(): string {
		return this._chainId;
	}

	@action
	setChainId(chainId: string) {
		this._chainId = chainId;
	}

	@computed
	get swappableCurrencies(): Currency[] {
		const chainInfo = this.chainStore.getChain(this.chainId);
		return this.swapManager.swappableCurrencies.map(cur => {
			return chainInfo.forceFindCurrency(cur.coinMinimalDenom);
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
	setInAmount(amount: string) {
		if (amount.startsWith('.')) {
			amount = '0' + amount;
		}

		if (amount) {
			try {
				// 숫자가 맞는지 and 양수인지 확인...
				if (new Dec(amount).lt(new Dec(0))) {
					return;
				}
			} catch {
				return;
			}
		}
		this._inAmount = amount;
	}

	@action
	setSlippage(slippage: string) {
		if (slippage.startsWith('.')) {
			slippage = '0' + slippage;
		}

		if (slippage) {
			try {
				// 숫자가 맞는지 and 양수인지 확인...
				if (new Dec(slippage).lt(new Dec(0))) {
					return;
				}
			} catch {
				return;
			}
		}
		this._slippage = slippage;
	}

	@computed
	get slippage(): string {
		return this._slippage;
	}

	@computed
	get inCurrency(): Currency {
		if (this.inCurrencyMinimalDenom) {
			const find = this.swappableCurrencies.find(cur => cur.coinMinimalDenom === this.inCurrencyMinimalDenom);
			if (find) {
				return find;
			}
		}

		return this.swappableCurrencies[0];
	}

	@computed
	get outCurrency(): Currency {
		if (this.outCurrencyMinimalDenom) {
			const find = this.swappableCurrencies.find(cur => cur.coinMinimalDenom === this.outCurrencyMinimalDenom);
			if (find) {
				return find;
			}
		}

		return this.swappableCurrencies[1];
	}

	@computed
	get inAmount(): CoinPretty {
		if (!this._inAmount) {
			return new CoinPretty(this.inCurrency, new Int('0'));
		}

		return new CoinPretty(
			this.inCurrency,
			new Dec(this._inAmount).mul(DecUtils.getPrecisionDec(this.inCurrency.coinDecimals))
		);
	}

	get inAmountText(): string {
		return this._inAmount;
	}

	@computed
	get spotPrice(): IntPretty {
		const computed = this.swapManager.computeOptimizedRoues(
			this.queryPools,
			this.inCurrency.coinMinimalDenom,
			this.outCurrency.coinMinimalDenom
		);

		if (!computed) {
			return new IntPretty(new Int(0));
		}

		return computed.spotPrice;
	}

	@computed
	get poolId(): string | undefined {
		const computed = this.swapManager.computeOptimizedRoues(
			this.queryPools,
			this.inCurrency.coinMinimalDenom,
			this.outCurrency.coinMinimalDenom
		);

		if (!computed) {
			return undefined;
		}

		return computed.poolId;
	}

	@computed
	get outAmount(): CoinPretty {
		const inAmount = this.inAmount;
		if (inAmount.toDec().equals(new Dec(0))) {
			return new CoinPretty(
				this.outCurrency,
				new Dec('0').mul(DecUtils.getPrecisionDec(this.outCurrency.coinDecimals))
			);
		}

		const spotPrice = this.spotPrice;

		return new CoinPretty(
			this.outCurrency,
			this.inAmount
				.toDec()
				.mul(new Dec(1).quo(spotPrice.toDec()))
				.mul(DecUtils.getPrecisionDec(this.outCurrency.coinDecimals))
				.truncate()
		);
	}
}

export const TradeClipboard: FunctionComponent = observer(() => {
	// TODO : @Thunnini get swap fee
	// TODO: 이 부분 빼야됨. 메인 페이지에서는 자동으로 최적의 라우트를 계산해주는거라 swap fee가 유동적이라 고정된 값을 보여줄 수 없음.
	const swapPercent = 0.0003;

	const { chainStore, queriesStore, accountStore, swapManager } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);
	const [tradeState] = useState(
		() =>
			new TradeState(
				chainStore,
				chainStore.current.chainId,
				swapManager,
				account,
				queriesStore.get(chainStore.current.chainId).osmosis.queryGammPools
			)
	);
	tradeState.setChainId(chainStore.current.chainId);

	const [settings, setSettings] = React.useState<ITradeSettings>({
		slippageTolerance: 0.1,
		txDeadline: '20',
	} as ITradeSettings);

	return (
		<Container
			overlayClasses=""
			type={TCardTypes.CARD}
			className="w-full h-full shadow-elevation-24dp rounded-2xl relative border-2 border-cardInner">
			<ClipboardClip />
			<div className="p-2.5 h-full w-full">
				<div className="bg-cardInner rounded-md w-full h-full p-5">
					<TradeTxSettings tradeState={tradeState} />
					<section className="mt-5 w-full mb-12.5">
						<div className="relative">
							<div className="mb-4.5">
								<FromBox tradeState={tradeState} />
							</div>
							<div className="mb-4.5">
								<ToBox tradeState={tradeState} />
							</div>
							<div className="s-position-abs-center w-12 h-12 z-0">
								<Img className="w-12 h-12" src="/public/assets/sidebar/icon-border_unselected.svg" />
								<Img className="s-position-abs-center w-6 h-6" src="/public/assets/Icons/Switch.svg" />
							</div>
						</div>
						<FeesBox tradeState={tradeState} />
					</section>
					<section className="w-full">
						<SwapButton tradeState={tradeState} />
					</section>
				</div>
			</div>
		</Container>
	);
});

export interface ITradeSettings {
	slippageTolerance: number;
	txDeadline: string; // minutes
}

const SwapButton: FunctionComponent<{
	tradeState: TradeState;
}> = observer(({ tradeState }) => {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);

	const onButtonClick = () => {
		if (account.isReadyToSendMsgs) {
			const poolId = tradeState.poolId;
			if (!poolId) {
				throw new Error("Can't calculate the optimized pools");
			}

			/*
			 TODO: 슬리피지는 일단 5%로 설정한다. 나중에 슬리피지 설정을 만들어야한다.
			 */
			account.osmosis.sendSwapExactAmountInMsg(
				poolId,
				{
					currency: tradeState.inCurrency,
					amount: tradeState.inAmountText,
				},
				tradeState.outCurrency,
				tradeState.slippage
			);
		}
	};

	// TODO: 버튼이 disabled일 때의 스타일링 추가하기.
	// TODO: 트랜잭션을 보내는 중일때 버튼에 로딩 스타일링 추가하기.
	return (
		<button
			onClick={onButtonClick}
			className="bg-primary-200 h-15 flex justify-center items-center w-full rounded-lg shadow-elevation-04dp hover:opacity-75"
			disabled={!account.isReadyToSendMsgs}>
			<p className="font-body tracking-wide">SWAP</p>
		</button>
	);
});

const FeesBox: FunctionComponent<{
	tradeState: TradeState;
}> = observer(({ tradeState }) => {
	const outSpotPrice = tradeState.spotPrice;
	const inSpotPrice = tradeState.spotPrice.toDec().equals(new Dec(0))
		? tradeState.spotPrice
		: new IntPretty(new Dec(1).quo(tradeState.spotPrice.toDec()));

	return (
		<Container className="rounded-lg py-3 px-4.5 w-full border border-white-faint" type={TCardTypes.CARD}>
			<section className="w-full">
				<div className="flex justify-between items-center">
					<p className="text-sm text-wireframes-lightGrey">Rate</p>
					<p className="text-sm text-wireframes-lightGrey">
						<span className="mr-2">1 {tradeState.inCurrency.coinDenom.toUpperCase()} =</span>{' '}
						{inSpotPrice
							.maxDecimals(2)
							.trim(true)
							.toString()}{' '}
						{tradeState.outCurrency.coinDenom.toUpperCase()}
					</p>
				</div>
				<div className="flex justify-end items-center mt-1.5 mb-2.5">
					<p className="text-xs text-wireframes-grey">
						<span className="mr-2">1 {tradeState.outCurrency.coinDenom.toUpperCase()} =</span>{' '}
						{outSpotPrice
							.maxDecimals(2)
							.trim(true)
							.toString()}{' '}
						{tradeState.inCurrency.coinDenom.toUpperCase()}
					</p>
				</div>
				<div className="grid grid-cols-5">
					<p className="text-sm text-wireframes-lightGrey">Swap Fee</p>
					<p className="col-span-4 text-sm text-wireframes-lightGrey text-right truncate">논의 필요</p>
				</div>
			</section>
		</Container>
	);
});

const FromBox: FunctionComponent<{ tradeState: TradeState }> = observer(({ tradeState }) => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const balance = queries.queryBalances
		.getQueryBech32Address(account.bech32Address)
		.balances.find(bal => bal.currency.coinMinimalDenom === tradeState.inCurrency.coinMinimalDenom);

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
							amount={balance ? balance.balance : new CoinPretty(tradeState.inCurrency, new Int('0'))}
						/>
					</div>
					<button className="rounded-md py-1 px-1.5 bg-white-faint h-6 ml-1.25">
						<p className="text-xs">MAX</p>
					</button>
				</div>
			</section>
			<section className="flex justify-between items-center">
				<TokenDisplay
					openSelector={openSelector}
					setOpenSelector={setOpenSelector}
					token={tradeState.inCurrency.coinDenom}
				/>
				<TokenAmountInput
					amount={tradeState.inAmount}
					amountText={tradeState.inAmountText}
					onInput={text => tradeState.setInAmount(text)}
				/>
			</section>
			<div
				style={{ top: 'calc(100% - 16px)' }}
				className={cn('bg-surface rounded-b-2xl z-10 left-0 w-full', openSelector ? 'absolute' : 'hidden')}>
				<TokenListDisplay
					currencies={tradeState.swappableCurrencies.filter(
						cur => cur.coinMinimalDenom !== tradeState.outCurrency.coinMinimalDenom
					)}
					close={() => setOpenSelector(false)}
					onSelect={minimalDenom => tradeState.setInCurrency(minimalDenom)}
				/>
			</div>
		</div>
	);
});

const TokenAmountInput: FunctionComponent<{
	amount: CoinPretty;
	amountText: string;
	onInput: (input: string) => void;
}> = observer(({ amount, amountText, onInput }) => {
	const { priceStore } = useStore();

	const price =
		priceStore.calculatePrice('usd', amount) ?? new PricePretty(priceStore.getFiatCurrency('usd')!, new Int(0));

	return (
		<div style={{ maxWidth: '250px' }} className="flex flex-col items-end">
			<input
				type="number"
				style={{ maxWidth: '250px' }}
				onChange={e => onInput(e.currentTarget.value)}
				value={amountText}
				placeholder="0"
				className="s-tradebox-input s-number-input-default"
			/>
			<p className="font-body font-semibold text-sm truncate w-full text-right">≈ {price.toString()}</p>
		</div>
	);
});

const ToBox: FunctionComponent<{ tradeState: TradeState }> = observer(({ tradeState }) => {
	const [openSelector, setOpenSelector] = React.useState(false);
	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4 relative">
			<section className="flex justify-between items-center mb-2">
				<p>To</p>
			</section>
			<section className="grid grid-cols-2">
				<TokenDisplay
					setOpenSelector={setOpenSelector}
					openSelector={openSelector}
					token={tradeState.outCurrency.coinDenom}
				/>
				<div className="text-right flex flex-col justify-center h-full">
					<h5
						className={cn('text-xl font-title font-semibold truncate', {
							'opacity-40': tradeState.outAmount.toDec().equals(new Dec(0)),
						})}>
						{tradeState.outAmount
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
					currencies={tradeState.swappableCurrencies.filter(
						cur => cur.coinMinimalDenom !== tradeState.inCurrency.coinMinimalDenom
					)}
					close={() => setOpenSelector(false)}
					onSelect={minimalDenom => tradeState.setOutCurrency(minimalDenom)}
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
