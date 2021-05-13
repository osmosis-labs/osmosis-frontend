import React, { Dispatch, FunctionComponent, SetStateAction, useState } from 'react';
import { BaseDialog, BaseModalProps } from './base';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import InputSlider from 'react-input-slider';
import { useStore } from '../stores';
import { action, computed, makeObservable, observable } from 'mobx';
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from '@keplr-wallet/unit';
import { ObservableQueryBalances } from '@keplr-wallet/stores';
import { ObservableQueryPools } from '../stores/osmosis/query/pools';
import { Currency } from '@keplr-wallet/types';
import { MISC } from '../constants';
import { ObservableQueryGammPoolShare } from '../stores/osmosis/query/pool-share';
import { computedFn } from 'mobx-utils';

//	TODO : edit how the circle renders the border to make gradients work
const borderImages: Record<string, string> = {
	socialLive: '#89EAFB',
	greenBeach: '#00CEBA',
	kashmir: '#6976FE',
	frost: '#0069C4',
	cherry: '#FF652D',
	sunset: '#FFBC00',
	orangeCoral: '#FF8200',
	pinky: '#FF7A45',
};

enum Tabs {
	ADD,
	REMOVE,
}

export class ManageLiquidityStateBase {
	@observable
	protected _poolId: string;

	@observable
	protected _sender: string;

	@observable
	protected _queryPoolShare: ObservableQueryGammPoolShare;

	constructor(poolId: string, sender: string, queryPoolShare: ObservableQueryGammPoolShare) {
		this._poolId = poolId;
		this._sender = sender;
		this._queryPoolShare = queryPoolShare;

		makeObservable(this);
	}

	get poolId(): string {
		return this._poolId;
	}

	@action
	setPoolId(poolId: string) {
		this._poolId = poolId;
	}

	@action
	setSender(sender: string) {
		this._sender = sender;
	}

	get sender(): string {
		return this._sender;
	}

	@action
	setQueryPoolShare(queryPoolShare: ObservableQueryGammPoolShare) {
		this._queryPoolShare = queryPoolShare;
	}

	get poolShare(): CoinPretty {
		return this._queryPoolShare.getGammShare(this._sender, this.poolId);
	}
}

export class AddLiquidityState extends ManageLiquidityStateBase {
	@observable.ref
	protected _queryBalances: ObservableQueryBalances;

	@observable.ref
	protected _queryPools: ObservableQueryPools;

	/**
	 * 여러 토큰들이 input을 가지지만 사실 join pool은 share out amount를 요청할 뿐
	 * 특정 토큰들이 얼마씩 들어갈지는 정할 수 없다.
	 * 그러므로 어떤 토큰의 amount가 설정되면 나머지들은 거기에 맞춰서 비율대로 변해야만 한다.
	 * 이 필드는 마지막으로 설정된 토큰과 토큰의 amount를 나타낸다.
	 * @protected
	 */
	@observable.ref
	protected _currencyAmount:
		| {
				currency: Currency;
				amount: string;
		  }
		| undefined = undefined;

	constructor(
		poolId: string,
		sender: string,
		queryPoolShare: ObservableQueryGammPoolShare,
		queryPools: ObservableQueryPools,
		queryBalances: ObservableQueryBalances
	) {
		super(poolId, sender, queryPoolShare);

		this._queryPools = queryPools;
		this._queryBalances = queryBalances;
		this._sender = sender;

		makeObservable(this);
	}

	@action
	setQueryPools(queryPools: ObservableQueryPools) {
		this._queryPools = queryPools;
	}

	@action
	setQueryBalances(queryBalances: ObservableQueryBalances) {
		this._queryBalances = queryBalances;
	}

	@computed
	get poolAssets(): {
		weight: IntPretty;
		amount: CoinPretty;
		currency: Currency;
	}[] {
		const pool = this._queryPools.getPool(this._poolId);
		if (!pool) {
			return [];
		}
		return pool.poolAssets.map(asset => {
			return {
				weight: asset.weight,
				amount: asset.amount,
				currency: asset.amount.currency,
			};
		});
	}

	@computed
	get totalWeight(): IntPretty {
		let result = new IntPretty(new Int(0));
		for (const asset of this.poolAssets) {
			result = result.add(asset.weight);
		}
		return result;
	}

	@computed
	get totalShare(): IntPretty {
		const pool = this._queryPools.getPool(this._poolId);
		if (!pool) {
			return new IntPretty(new Int(0));
		}

		return pool.totalShare;
	}

	@action
	setAmountOfCurrency(currency: Currency, amount: string) {
		if (amount.startsWith('.')) {
			amount = '0' + amount;
		}

		try {
			// amount가 숫자인지와 양수인지를 체크한다.
			const dec = new Dec(amount);
			if (dec.lt(new Dec(0))) {
				return;
			}
		} catch {
			return;
		}

		this._currencyAmount = {
			currency,
			amount,
		};
	}

	@computed
	get shareOutAmount(): IntPretty {
		if (!this._currencyAmount) {
			return new IntPretty(new Int(0));
		}
		/*
			share out amount = (token in amount * total share) / pool asset
		 */
		const tokenInAmount = new IntPretty(new Dec(this._currencyAmount.amount));
		const totalShare = this.totalShare;
		const poolAsset = this.poolAssets.find(
			asset => asset.currency.coinMinimalDenom === this._currencyAmount?.currency.coinMinimalDenom
		);

		if (tokenInAmount.toDec().equals(new Dec(0))) {
			return new IntPretty(new Int(0));
		}

		if (totalShare.toDec().equals(new Dec(0))) {
			return new IntPretty(new Int(0));
		}

		if (!poolAsset) {
			return new IntPretty(new Int(0));
		}

		return tokenInAmount.add(totalShare).quo(poolAsset.amount);
	}

	/**
	 * 마지막으로 설정된 currency와 같다면 그 자체의 값을 반환한다.
	 * 아니라면 계산된 결과를 반환한다.
	 */
	computeCurrencyAmountText = computedFn((currency: Currency): string => {
		if (!this._currencyAmount) {
			return '';
		}

		if (this._currencyAmount.currency.coinMinimalDenom === currency.coinMinimalDenom) {
			return this._currencyAmount.amount;
		}

		const poolAsset = this.poolAssets.find(asset => asset.currency.coinMinimalDenom === currency.coinMinimalDenom);

		if (!poolAsset) {
			return '';
		}

		const totalShare = this.totalShare;
		if (totalShare.toDec().equals(new Dec(0))) {
			return '';
		}

		const shareOutAmount = this.shareOutAmount;

		return shareOutAmount
			.mul(poolAsset.amount)
			.quo(totalShare)
			.trim(true)
			.shrink(true)
			.maxDecimals(2)
			.toString();
	});
}

export class RemoveLiquidityState extends ManageLiquidityStateBase {
	@observable
	protected _percentage: string;

	constructor(poolId: string, sender: string, queryPoolShare: ObservableQueryGammPoolShare, initialPercentage: string) {
		super(poolId, sender, queryPoolShare);

		this._percentage = initialPercentage;

		makeObservable(this);
	}

	get percentage(): number {
		return parseFloat(this._percentage);
	}

	@action
	setPercentage(percentage: string) {
		const value = parseFloat(percentage);
		if (value > 0 && value <= 100) {
			this._percentage = percentage;
		}
	}

	@computed
	get poolShareWithPercentage(): CoinPretty {
		return this.poolShare.mul(new Dec(this.percentage).quo(DecUtils.getPrecisionDec(2)));
	}
}

export const ManageLiquidityDialog: FunctionComponent<BaseModalProps & {
	poolId: string;
}> = observer(({ isOpen, close, poolId }) => {
	const [tab, setTab] = React.useState<Tabs>(Tabs.ADD);

	const { chainStore, queriesStore, accountStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const [addLiquidityState] = useState(
		() =>
			new AddLiquidityState(
				poolId,
				account.bech32Address,
				queries.osmosis.queryGammPoolShare,
				queries.osmosis.queryGammPools,
				queries.queryBalances
			)
	);
	addLiquidityState.setPoolId(poolId);
	addLiquidityState.setQueryPoolShare(queries.osmosis.queryGammPoolShare);
	addLiquidityState.setQueryPools(queries.osmosis.queryGammPools);
	addLiquidityState.setQueryBalances(queries.queryBalances);
	addLiquidityState.setSender(account.bech32Address);

	const [removeLiquidityState] = useState(
		() => new RemoveLiquidityState(poolId, account.bech32Address, queries.osmosis.queryGammPoolShare, '35')
	);
	removeLiquidityState.setPoolId(poolId);
	removeLiquidityState.setQueryPoolShare(queries.osmosis.queryGammPoolShare);
	removeLiquidityState.setSender(account.bech32Address);

	return (
		<BaseDialog isOpen={isOpen} close={close}>
			<div className="text-white-high">
				<h5 className="mb-9">Manage Liquidity</h5>
				<div className="mb-7.5">
					<AddRemoveSelectTab setTab={setTab} tab={tab} />
				</div>
				{tab === Tabs.ADD ? (
					<AddLiquidity addLiquidityState={addLiquidityState} />
				) : (
					<RemoveLiquidity removeLiquidityState={removeLiquidityState} />
				)}
				<BottomButton tab={tab} addLiquidityState={addLiquidityState} removeLiquidityState={removeLiquidityState} />
			</div>
		</BaseDialog>
	);
});

const AddRemoveSelectTab: FunctionComponent<{
	tab: Tabs;
	setTab: Dispatch<SetStateAction<Tabs>>;
}> = ({ tab, setTab }) => {
	return (
		<ul className="w-full h-8 grid grid-cols-2">
			<li
				onClick={() => setTab(Tabs.ADD)}
				className={cn(
					'w-full h-full flex justify-center items-center border-secondary-200 group cursor-pointer',
					tab === Tabs.ADD ? 'border-b-2' : 'border-b border-opacity-30 hover:border-opacity-100'
				)}>
				<p className={cn('text-secondary-200', tab === Tabs.ADD ? 'pt-0.25' : 'opacity-40 group-hover:opacity-75')}>
					Add Liquidity
				</p>
			</li>
			<li
				onClick={() => setTab(Tabs.REMOVE)}
				className={cn(
					'w-full h-full flex justify-center items-center border-secondary-200 group cursor-pointer',
					tab === Tabs.REMOVE ? 'border-b-2' : 'border-b border-opacity-30 hover:border-opacity-100'
				)}>
				<p className={cn('text-secondary-200', tab === Tabs.REMOVE ? 'pt-0.25' : 'opacity-40 group-hover:opacity-75')}>
					Remove Liquidity
				</p>
			</li>
		</ul>
	);
};

const AddLiquidity: FunctionComponent<{
	addLiquidityState: AddLiquidityState;
}> = observer(({ addLiquidityState }) => {
	const poolShare = addLiquidityState.poolShare;

	return (
		<React.Fragment>
			<p className="text-xs text-white-disabled mb-4.5">
				LP token balance:{' '}
				<span className="ml-1 text-secondary-200">
					{poolShare
						.shrink(true)
						.trim(true)
						.toString()}
				</span>
			</p>
			<ul className="flex flex-col gap-4.5 mb-15">
				{addLiquidityState.poolAssets.map((asset, i) => (
					<TokenLiquidityItem key={asset.currency.coinMinimalDenom} index={i} addLiquidityState={addLiquidityState} />
				))}
			</ul>
		</React.Fragment>
	);
});

const TokenLiquidityItem: FunctionComponent<{
	addLiquidityState: AddLiquidityState;
	index: number;
}> = observer(({ addLiquidityState, index }) => {
	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const queryBalance = queries.queryBalances.getQueryBech32Address(addLiquidityState.sender);

	const poolAsset = addLiquidityState.poolAssets[index];
	const currency = poolAsset.currency;
	const percentage = poolAsset.weight.quo(addLiquidityState.totalWeight).decreasePrecision(2);

	return (
		<li className="w-full border border-white-faint rounded-2xl py-3.75 px-4">
			<section className="flex items-center justify-between">
				<div className="flex items-center">
					<figure
						style={{ fontSize: '60px' }}
						className={cn(
							'c100 dark mr-5',
							`p${percentage
								.maxDecimals(0)
								.locale(false)
								.toString()}`
						)}>
						<span>{percentage.maxDecimals(0).toString()}%</span>
						<div className="slice">
							<div style={{ background: `${borderImages[MISC.GRADIENTS[index]]}` }} className="bar" />
							<div className="fill" />
						</div>
					</figure>
					<div className="flex flex-col">
						<h5>{currency.coinDenom.toUpperCase()}</h5>
					</div>
				</div>
				<div className="flex flex-col items-end">
					<p className="text-xs">
						Available{' '}
						<span className="text-primary-50">
							{queryBalance
								.getBalanceFromCurrency(currency)
								.trim(true)
								.shrink(true)
								.toString()}
						</span>
					</p>
					<div className="bg-background px-1.5 py-0.5 rounded-lg">
						<input
							onChange={e => {
								e.preventDefault();

								addLiquidityState.setAmountOfCurrency(currency, e.target.value);
							}}
							value={addLiquidityState.computeCurrencyAmountText(currency)}
							className="text-xl text-white-high text-right"
						/>
					</div>
				</div>
			</section>
		</li>
	);
});

const RemoveLiquidity: FunctionComponent<{
	removeLiquidityState: RemoveLiquidityState;
}> = observer(({ removeLiquidityState }) => {
	return (
		<div className="mt-15 w-full flex flex-col justify-center items-center">
			<h2>
				<input
					value={removeLiquidityState.percentage}
					size={removeLiquidityState.percentage.toString().length}
					onChange={e => {
						e.preventDefault();

						removeLiquidityState.setPercentage(e.target.value);
					}}
				/>
				<div className="inline-block" style={{ marginLeft: '-1rem' }}>
					%
				</div>
			</h2>
			<div className="mt-5 mb-15 w-full">
				<InputSlider
					styles={{
						track: {
							width: '100%',
							height: '4px',
						},
						active: {
							backgroundColor: 'transparent',
						},
						thumb: {
							width: '28px',
							height: '28px',
						},
					}}
					axis="x"
					xstep={0.1}
					xmin={0.1}
					xmax={100}
					x={removeLiquidityState.percentage}
					onChange={({ x }) => removeLiquidityState.setPercentage(parseFloat(x.toFixed(2)).toString())}
				/>
			</div>
			<div className="grid grid-cols-4 gap-5 h-9 w-full mb-15">
				<button
					onClick={() => removeLiquidityState.setPercentage('25')}
					className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75">
					<p className="text-secondary-200">25%</p>
				</button>
				<button
					onClick={() => removeLiquidityState.setPercentage('50')}
					className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75">
					<p className="text-secondary-200">50%</p>
				</button>
				<button
					onClick={() => removeLiquidityState.setPercentage('75')}
					className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75">
					<p className="text-secondary-200">75%</p>
				</button>
				<button
					onClick={() => removeLiquidityState.setPercentage('100')}
					className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75">
					<p className="text-secondary-200">100%</p>
				</button>
			</div>
		</div>
	);
});

const BottomButton: FunctionComponent<{
	tab: Tabs;
	addLiquidityState: AddLiquidityState;
	removeLiquidityState: RemoveLiquidityState;
}> = observer(({ tab, addLiquidityState, removeLiquidityState }) => {
	const { chainStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);

	return (
		<div className="w-full flex items-center justify-center">
			<button
				className="w-2/3 h-15 bg-primary-200 rounded-2xl flex justify-center items-center hover:opacity-75 cursor-pointer"
				onClick={e => {
					e.preventDefault();

					if (account.isReadyToSendMsgs) {
						if (tab === Tabs.ADD) {
							const shareOutAmount = addLiquidityState.shareOutAmount;

							// XXX: 일단 이 경우 슬리피지를 2.5%로만 설정한다.
							// TODO: 트랜잭션을 보내는 중일때 버튼에 로딩 표시(?)
							account.osmosis.sendJoinPoolMsg(addLiquidityState.poolId, shareOutAmount.toDec().toString(), '2.5');
						}

						// TODO: 트랜잭션을 보낼 준비가 안됐으면 버튼을 disabled 시키기
						if (tab === Tabs.REMOVE) {
							const shareIn = removeLiquidityState.poolShareWithPercentage;

							// XXX: 일단 이 경우 슬리피지를 2.5%로만 설정한다.
							// TODO: 트랜잭션을 보내는 중일때 버튼에 로딩 표시(?)
							account.osmosis.sendExitPoolMsg(removeLiquidityState.poolId, shareIn.toDec().toString(), '2.5');
						}
					}
				}}>
				<p className="text-white-high font-semibold text-lg">{`${tab === Tabs.ADD ? 'Add' : 'Remove'} Liquidity`}</p>
			</button>
		</div>
	);
});
