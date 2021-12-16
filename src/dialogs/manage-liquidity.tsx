import { TxChainSetter } from '@keplr-wallet/hooks';
import { ChainGetter, ObservableQueryBalances } from '@keplr-wallet/stores';
import { AppCurrency, Currency } from '@keplr-wallet/types';
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from '@keplr-wallet/unit';
import cn from 'clsx';
import { findIndex } from 'lodash-es';
import { action, computed, makeObservable, observable, override } from 'mobx';
import { observer } from 'mobx-react-lite';
import { computedFn } from 'mobx-utils';
import React, { Dispatch, FunctionComponent, SetStateAction, useState } from 'react';
import InputSlider from 'react-input-slider';
import { AmountInput } from '../components/form/Inputs';
import { MISC } from '../constants';
import { OSMO_MEDIUM_TX_FEE } from '../constants/fee';
import { BasicAmountConfig } from '../hooks/tx/basic-amount-config';
import { useStore } from '../stores';
import { ObservableQueryGammPoolShare } from '../stores/osmosis/query/pool-share';
import { ObservableQueryPools } from '../stores/osmosis/query/pools';
import { wrapBaseDialog } from './base';
import useWindowSize from 'src/hooks/useWindowSize';
import { TokenSelect } from 'src/components/SwapToken/TokenSelect';
import { useBooleanStateWithWindowEvent } from 'src/hooks/useBooleanStateWithWindowEvent';
import { IconExternalLink, IconCheckBox } from 'src/icons';

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

export class ManageLiquidityConfigBase extends TxChainSetter {
	@observable
	protected _poolId: string;

	@observable
	protected _sender: string;

	@observable
	protected _queryPoolShare: ObservableQueryGammPoolShare;

	constructor(
		chainGetter: ChainGetter,
		initialChainId: string,
		poolId: string,
		sender: string,
		queryPoolShare: ObservableQueryGammPoolShare
	) {
		super(chainGetter, initialChainId);

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
		return this._queryPoolShare.getAvailableGammShare(this._sender, this.poolId);
	}
}

export class AddLiquidityConfig extends ManageLiquidityConfigBase {
	@observable.ref
	protected _queryBalances: ObservableQueryBalances;

	@observable.ref
	protected _queryPools: ObservableQueryPools;

	@observable.ref
	protected _shareOutAmount: IntPretty | undefined = undefined;

	@observable
	protected _isSingleAmountIn: boolean = false;

	/*
	 Used to get the amount config if the mode is single amount in.
	 */
	@observable
	protected _singleAmountInConfigIndex: number = 0;

	protected _cacheAmountConfigs?: {
		poolId: string;
		sender: string;
		configs: BasicAmountConfig[];
	};

	constructor(
		chainGetter: ChainGetter,
		initialChainId: string,
		poolId: string,
		sender: string,
		queryPoolShare: ObservableQueryGammPoolShare,
		queryPools: ObservableQueryPools,
		queryBalances: ObservableQueryBalances
	) {
		super(chainGetter, initialChainId, poolId, sender, queryPoolShare);

		this._queryPools = queryPools;
		this._queryBalances = queryBalances;
		this._sender = sender;

		makeObservable(this);
	}

	@override
	setSender(sender: string) {
		super.setSender(sender);

		for (const asset of this.poolAssetConfigs) {
			asset.setSender(sender);
		}
	}

	@override
	setChain(chainId: string) {
		super.setChain(chainId);

		for (const asset of this.poolAssetConfigs) {
			asset.setChain(chainId);
		}
	}

	@action
	setQueryPools(queryPools: ObservableQueryPools) {
		this._queryPools = queryPools;
	}

	@action
	setQueryBalances(queryBalances: ObservableQueryBalances) {
		this._queryBalances = queryBalances;

		for (const asset of this.poolAssetConfigs) {
			asset.setQueryBalances(queryBalances);
		}
	}

	get isSingleAmountIn(): boolean {
		return this._isSingleAmountIn;
	}

	get singleAmountInConfigIndex(): number {
		return this._singleAmountInConfigIndex;
	}

	/*
	 Return the `BasicAmountConfig` of selected single amount in.
	 Return undefined if the mode is no single amount in
	 or `singleAmountInConfigIndex` is out of range in poolAssetConfigs.
	 */
	@computed
	get singleAmountInConfig(): BasicAmountConfig | undefined {
		if (!this.isSingleAmountIn) {
			return;
		}

		if (this.poolAssetConfigs.length === 0) {
			return;
		}

		if (this.poolAssetConfigs.length <= this.singleAmountInConfigIndex) {
			return;
		}

		return this.poolAssetConfigs[this.singleAmountInConfigIndex];
	}

	@action
	setIsSingleAmountIn(value: boolean) {
		this._isSingleAmountIn = value;
	}

	@action
	setSingleAmountInConfigIndex(index: number) {
		this._singleAmountInConfigIndex = index;
	}

	@computed
	get singleAmountInPriceImpact(): IntPretty | undefined {
		if (!this.isSingleAmountIn) {
			return;
		}

		try {
			const config = this.singleAmountInConfig;
			if (!config) {
				return;
			}

			const poolAsset = this.poolAssets.find(
				asset => asset.currency.coinMinimalDenom === config.currency.coinMinimalDenom
			);
			if (!poolAsset) {
				return;
			}

			/*
			 The spot price is ( Bi / Wi ) / (Bo / Wo).
			 And "single amount in" only changes the Bi or Bo.
			 Others can be handles as constant.
			 So, we can calculate the price impact by just consider the added amount of one asset.
			 */
			return new IntPretty(
				new Dec(1)
					.sub(
						poolAsset.amount
							.toDec()
							.quo(
								poolAsset.amount
									.toDec()
									.add(
										new CoinPretty(
											config.currency,
											new Dec(config.amount).mul(DecUtils.getPrecisionDec(config.currency.coinDecimals))
										).toDec()
									)
							)
					)
					.mul(new Dec(100))
			);
		} catch (e) {
			console.log(e);
			return;
		}
	}

	/*
   TODO: This getter is not flexible.
         Can't handle the case that the chain changes.
         Can't handle the case that the pool's currencies changes.
         Can't handle the case that the reference of chain getter or balance querier.
         However, above cases don't exist on the current usage.
         Due to the current architecture of this store, it is hard to handle above cases.
         Refactor this store in future.
   */
	@computed
	get poolAssetConfigs(): BasicAmountConfig[] {
		const pool = this._queryPools.getPool(this._poolId);
		if (!pool) {
			return [];
		}

		if (
			!this._cacheAmountConfigs ||
			this._cacheAmountConfigs.poolId !== pool.id ||
			this._cacheAmountConfigs.sender !== this.sender ||
			this._cacheAmountConfigs.configs.length === 0
		) {
			this._cacheAmountConfigs = {
				poolId: pool.id,
				sender: this.sender,
				configs: pool.poolAssets.map(asset => {
					return new BasicAmountConfig(
						this.chainGetter,
						this.chainId,
						this.sender,
						asset.amount.currency,
						this._queryBalances
					);
				}),
			};
		}

		return this._cacheAmountConfigs.configs;
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

	get shareOutAmount(): IntPretty | undefined {
		return this._shareOutAmount;
	}

	@action
	setAmountAt(index: number, amount: string, isMax = false): void {
		const amountConfig = this.poolAssetConfigs[index];
		amountConfig.setAmount(amount);

		if (amountConfig.getError() == null) {
			/*
        share out amount = (token in amount * total share) / pool asset
       */
			const tokenInAmount = new IntPretty(new Dec(amountConfig.amount));
			const totalShare = this.totalShare;
			const poolAsset = this.poolAssets.find(
				asset => asset.currency.coinMinimalDenom === amountConfig.currency.coinMinimalDenom
			);

			if (tokenInAmount.toDec().equals(new Dec(0))) {
				this._shareOutAmount = undefined;
				return;
			}

			if (totalShare.toDec().equals(new Dec(0))) {
				this._shareOutAmount = undefined;
				return;
			}

			if (!poolAsset) {
				this._shareOutAmount = undefined;
				return;
			}

			// totalShare / poolAsset.amount = totalShare per poolAssetAmount = total share per tokenInAmount
			// tokenInAmount * (total share per tokenInAmount) = totalShare of given tokenInAmount aka shareOutAmount;
			// tokenInAmount in terms of totalShare unit

			// shareOutAmount / totalShare = totalShare proportion of tokenInAmount;
			// totalShare proportion of tokenInAmount * otherTotalPoolAssetAmount = otherPoolAssetAmount

			const shareOutAmount = tokenInAmount.mul(totalShare).quo(poolAsset.amount);
			const otherConfigs = this.poolAssetConfigs.slice();
			otherConfigs.splice(index, 1);

			for (const otherConfig of otherConfigs) {
				const poolAsset = this.poolAssets.find(
					asset => asset.currency.coinMinimalDenom === otherConfig.currency.coinMinimalDenom
				);

				if (!poolAsset) {
					this._shareOutAmount = undefined;
					return;
				}

				otherConfig.setAmount(
					shareOutAmount
						.mul(poolAsset.amount)
						.quo(totalShare)
						.trim(true)
						.shrink(true)
						.maxDecimals(isMax ? 6 : 2)
						.locale(false)
						.toString()
				);
			}

			this._shareOutAmount = shareOutAmount;
		} else {
			this._shareOutAmount = undefined;
		}
	}

	@action
	setMax() {
		if (this.isSingleAmountIn && this.singleAmountInConfig) {
			const config = this.singleAmountInConfig;
			config.setIsMax(true);
			this.setAmountAt(this.singleAmountInConfigIndex, config.amount);
			config.setIsMax(false);
			return;
		}

		const balancePrettyList = this.poolAssetConfigs.map(poolAssetConfig =>
			this._queryBalances.getQueryBech32Address(this.sender).getBalanceFromCurrency(poolAssetConfig.currency)
		);
		if (balancePrettyList.some(balancePretty => balancePretty.toDec().equals(new Dec(0)))) {
			return this.poolAssetConfigs.forEach(poolAssetConfig => poolAssetConfig.setAmount('0'));
		}
		let feasibleMaxFound = false;
		const totalShare = this.totalShare;
		balancePrettyList.forEach(balancePretty => {
			if (feasibleMaxFound) {
				return;
			}
			const baseBalanceInt = new IntPretty(balancePretty);
			const basePoolAsset = this.poolAssets.find(
				poolAsset => poolAsset.currency.coinMinimalDenom === balancePretty.currency.coinMinimalDenom
			)!;
			const baseShareOutAmount = baseBalanceInt.mul(totalShare).quo(basePoolAsset.amount);
			const outAmountInfoList = this.poolAssets.map(poolAsset => {
				const coinMinimalDenom = poolAsset.currency.coinMinimalDenom;
				if (basePoolAsset.currency.coinMinimalDenom === coinMinimalDenom) {
					return {
						coinMinimalDenom,
						outAmount: baseBalanceInt,
					};
				}
				return {
					coinMinimalDenom,
					outAmount: baseShareOutAmount.mul(poolAsset.amount).quo(totalShare),
				};
			});
			const hasInsufficientBalance = outAmountInfoList.some(outAmountInfo => {
				const balanceInfo = balancePrettyList.find(
					balance => balance.currency.coinMinimalDenom === outAmountInfo.coinMinimalDenom
				)!;
				return balanceInfo.toDec().lt(outAmountInfo.outAmount.toDec());
			});
			if (hasInsufficientBalance) {
				return;
			}
			feasibleMaxFound = true;

			const osmoIndex = findIndex(this.poolAssetConfigs, poolAssetConfig => {
				return poolAssetConfig.currency.coinMinimalDenom === 'uosmo';
			});

			if (osmoIndex !== -1) {
				const osmoOutAmountInfo = outAmountInfoList.find(outAmountInfo => outAmountInfo.coinMinimalDenom === 'uosmo')!;
				const osmoBalanceInfo = balancePrettyList.find(balance => balance.currency.coinMinimalDenom === 'uosmo')!;
				const osmoOutAmount = osmoBalanceInfo
					.toDec()
					.sub(new Dec(OSMO_MEDIUM_TX_FEE))
					.lt(osmoOutAmountInfo.outAmount.toDec())
					? osmoOutAmountInfo.outAmount.sub(new Dec(OSMO_MEDIUM_TX_FEE))
					: osmoOutAmountInfo.outAmount;

				return this.setAmountAt(
					osmoIndex,
					osmoOutAmount
						.trim(true)
						.shrink(true)
						/** osmo is used to pay tx fees, should have some padding left for future tx? if no padding needed maxDecimals to 6 else 2*/
						.maxDecimals(6)
						.locale(false)
						.toString(),
					true
				);
			}

			/**TODO: should use cheaper coin to setAmount for higher accuracy*/
			const baseOutAmountInfo = outAmountInfoList.find(outAmountInfo => {
				return outAmountInfo.coinMinimalDenom === this.poolAssetConfigs[0].currency.coinMinimalDenom;
			})!;

			this.setAmountAt(
				0,
				baseOutAmountInfo.outAmount
					.trim(true)
					.shrink(true)
					.maxDecimals(6)
					.locale(false)
					.toString(),
				true
			);
		});
	}

	readonly getError = computedFn(() => {
		if (this.poolAssetConfigs.length === 0) {
			return new Error('Not initialized yet');
		}

		if (this.isSingleAmountIn && this.singleAmountInConfig) {
			const config = this.singleAmountInConfig;
			const error = config.getError();
			if (error != null) {
				return error;
			}

			return;
		} else {
			for (const config of this.poolAssetConfigs) {
				const error = config.getError();
				if (error != null) {
					return error;
				}
			}
		}

		if (!this.shareOutAmount || this.shareOutAmount.toDec().lte(new Dec(0))) {
			return new Error('Calculating the share out amount');
		}
	});
}

export class RemoveLiquidityConfig extends ManageLiquidityConfigBase {
	@observable
	protected _percentage: string;

	constructor(
		chainGetter: ChainGetter,
		initialChainId: string,
		poolId: string,
		sender: string,
		queryPoolShare: ObservableQueryGammPoolShare,
		initialPercentage: string
	) {
		super(chainGetter, initialChainId, poolId, sender, queryPoolShare);

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
		return this.poolShare.mul(new Dec(this.percentage.toString()).quo(DecUtils.getPrecisionDec(2)));
	}
}

export const ManageLiquidityDialog = wrapBaseDialog(
	observer(({ poolId, close }: { poolId: string; close: () => void }) => {
		const [tab, setTab] = React.useState<Tabs>(Tabs.ADD);

		const { chainStore, queriesStore, accountStore } = useStore();

		const { isMobileView } = useWindowSize();

		const queries = queriesStore.get(chainStore.current.chainId);
		const account = accountStore.getAccount(chainStore.current.chainId);

		const [addLiquidityConfig] = useState(
			() =>
				new AddLiquidityConfig(
					chainStore,
					chainStore.current.chainId,
					poolId,
					account.bech32Address,
					queries.osmosis.queryGammPoolShare,
					queries.osmosis.queryGammPools,
					queries.queryBalances
				)
		);
		addLiquidityConfig.setChain(chainStore.current.chainId);
		addLiquidityConfig.setPoolId(poolId);
		addLiquidityConfig.setQueryPoolShare(queries.osmosis.queryGammPoolShare);
		addLiquidityConfig.setQueryPools(queries.osmosis.queryGammPools);
		addLiquidityConfig.setQueryBalances(queries.queryBalances);
		addLiquidityConfig.setSender(account.bech32Address);

		const [removeLiquidityConfig] = useState(
			() =>
				new RemoveLiquidityConfig(
					chainStore,
					chainStore.current.chainId,
					poolId,
					account.bech32Address,
					queries.osmosis.queryGammPoolShare,
					'35'
				)
		);
		removeLiquidityConfig.setChain(chainStore.current.chainId);
		removeLiquidityConfig.setPoolId(poolId);
		removeLiquidityConfig.setQueryPoolShare(queries.osmosis.queryGammPoolShare);
		removeLiquidityConfig.setSender(account.bech32Address);

		return (
			<div className="text-white-high w-full h-full">
				<h5 className="text-lg md:text-xl mb-5 md:mb-9">Manage Liquidity</h5>
				<div className="mb-3 md:mb-7.5">
					<AddRemoveSelectTab setTab={setTab} tab={tab} />
				</div>
				{tab === Tabs.ADD ? (
					<AddLiquidity addLiquidityConfig={addLiquidityConfig} />
				) : (
					<RemoveLiquidity removeLiquidityConfig={removeLiquidityConfig} isMobileView={isMobileView} />
				)}
				<BottomButton
					tab={tab}
					addLiquidityConfig={addLiquidityConfig}
					removeLiquidityConfig={removeLiquidityConfig}
					close={close}
				/>
			</div>
		);
	})
);

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
				<p
					className={cn(
						'text-secondary-200',
						tab === Tabs.ADD ? 'pt-0.25' : 'opacity-40 group-hover:opacity-75',
						'text-sm md:text-base'
					)}>
					Add Liquidity
				</p>
			</li>
			<li
				onClick={() => setTab(Tabs.REMOVE)}
				className={cn(
					'w-full h-full flex justify-center items-center border-secondary-200 group cursor-pointer',
					tab === Tabs.REMOVE ? 'border-b-2' : 'border-b border-opacity-30 hover:border-opacity-100'
				)}>
				<p
					className={cn(
						'text-secondary-200',
						tab === Tabs.REMOVE ? 'pt-0.25' : 'opacity-40 group-hover:opacity-75',
						'text-sm md:text-base'
					)}>
					Remove Liquidity
				</p>
			</li>
		</ul>
	);
};

const AddLiquidity: FunctionComponent<{
	addLiquidityConfig: AddLiquidityConfig;
}> = observer(({ addLiquidityConfig }) => {
	const poolShare = addLiquidityConfig.poolShare;
	const [isMouseOverInfoIcon, setIsMouseOverInfoIcon] = useState(false);
	const [isMouseOverToolTip, setIsMouseOverTooltip] = useState(false);

	return (
		<React.Fragment>
			<p className="text-xs text-white-disabled mb-3 md:mb-4.5">
				LP token balance:{' '}
				<span className="ml-1 text-secondary-200">
					{poolShare
						.shrink(true)
						.trim(true)
						.toString()}
				</span>
			</p>
			{addLiquidityConfig.isSingleAmountIn ? (
				<ul className="flex flex-col">
					<TokenLiquidityItem
						index={addLiquidityConfig.singleAmountInConfigIndex}
						addLiquidityConfig={addLiquidityConfig}
						isSingleAmountIn={addLiquidityConfig.isSingleAmountIn}
					/>
				</ul>
			) : (
				<ul className="flex flex-col gap-3 md:gap-4.5">
					{addLiquidityConfig.poolAssets.map((asset, i) => (
						<TokenLiquidityItem
							key={asset.currency.coinMinimalDenom}
							index={i}
							addLiquidityConfig={addLiquidityConfig}
						/>
					))}
				</ul>
			)}
			<div className="relative flex items-center justify-end mt-5">
				<label
					htmlFor="checkbox"
					className="text-sm md:text-base flex justify-end items-center mr-2 cursor-pointer font-semibold"
					onClick={() => addLiquidityConfig.setIsSingleAmountIn(!addLiquidityConfig.isSingleAmountIn)}>
					{addLiquidityConfig.isSingleAmountIn ? (
						<div className="mr-2.5">
							<IconCheckBox />
						</div>
					) : (
						<div className="w-6 h-6 border-2 border-white-high mr-2.5 rounded" />
					)}
					Single Asset LP
				</label>
				<img
					className="h-5 w-5 cursor-pointer"
					src="/public/assets/Icons/Information.svg"
					onMouseEnter={() => setIsMouseOverInfoIcon(true)}
					onMouseLeave={() => {
						const timeoutId = window.setTimeout(() => {
							setIsMouseOverInfoIcon(false);
							window.clearTimeout(timeoutId);
						}, 100);
					}}
				/>

				{(isMouseOverInfoIcon || isMouseOverToolTip) && (
					<div
						style={{ maxWidth: '297px' }}
						className="absolute z-10 -right-0.5 md:-right-2 bottom-7 bg-wireframes-darkGrey border border-white-faint p-2 rounded-lg"
						onMouseEnter={() => setIsMouseOverTooltip(true)}
						onMouseLeave={() => setIsMouseOverTooltip(false)}>
						<div className="text-white-high text-sm mb-1 leading-tight">
							Single Asset LP allows you to provide liquidity using one asset. However, this will impact the pool price
							of the asset you’re providing liquidity with.
						</div>
					</div>
				)}
			</div>

			{addLiquidityConfig.isSingleAmountIn && (
				<div className="p-3 md:p-4 rounded-lg bg-card border border-white-faint flex flex-col mt-5">
					<div className="flex justify-between">
						<div className="text-sm leading-6 text-white-mid">Price impact</div>
						<div className="text-sm leading-6 text-white-high">
							{(() => {
								const value = addLiquidityConfig.singleAmountInPriceImpact;
								if (!value) {
									return '-';
								}

								if (value.toDec().lt(new Dec('0.001'))) {
									return `< 0.001%`;
								}

								if (value)
									return (
										value
											.maxDecimals(3)
											.trim(true)
											.toString() + '%'
									);
							})()}
						</div>
					</div>
				</div>
			)}
		</React.Fragment>
	);
});

const TokenLiquidityItem: FunctionComponent<{
	addLiquidityConfig: AddLiquidityConfig;
	index: number;
	isSingleAmountIn?: boolean;
}> = observer(({ addLiquidityConfig, index, isSingleAmountIn: isSingleAmountIn }) => {
	const { chainStore, queriesStore } = useStore();
	const { isMobileView } = useWindowSize();
	const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useBooleanStateWithWindowEvent(false);

	const currentCurrency = addLiquidityConfig.poolAssets[index].currency;

	const queries = queriesStore.get(chainStore.current.chainId);
	const queryBalance = queries.queryBalances.getQueryBech32Address(addLiquidityConfig.sender);

	const percentage = addLiquidityConfig.poolAssets[index].weight
		.quo(addLiquidityConfig.totalWeight)
		.decreasePrecision(2);

	return (
		<li
			style={isTokenDropdownOpen ? { borderBottomLeftRadius: 0 } : undefined}
			className="w-full border border-white-faint rounded-2xl px-2 py-2.5 md:py-3.75 md:px-4">
			<section className="flex items-center justify-between">
				<div className="flex items-center">
					{isSingleAmountIn ? (
						<TokenSelect
							options={addLiquidityConfig.poolAssets
								.filter(poolAsset => poolAsset.currency.coinDenom !== currentCurrency.coinDenom)
								.map(poolAsset => poolAsset.currency)}
							value={currentCurrency}
							onSelect={(appCurrency: AppCurrency) => {
								const index = addLiquidityConfig.poolAssets.findIndex(
									poolAsset => poolAsset.currency.coinDenom === appCurrency.coinDenom
								);

								if (index >= 0) {
									addLiquidityConfig.setSingleAmountInConfigIndex(index);
								}
							}}
							isDropdownOpen={isTokenDropdownOpen}
							onDropdownClose={() => setIsTokenDropdownOpen(false)}
							onDropdownOpen={() => setIsTokenDropdownOpen(true)}
							dropdownClassName="border border-white-faint"
							dropdownStyle={{
								paddingTop: isMobileView ? 10 : 16,
								paddingBottom: isMobileView ? 10 : 16,
								paddingLeft: isMobileView ? 4 : 6,
								paddingRight: isMobileView ? 6 : 12,
								left: isMobileView ? 3 : -1,
								bottom: isMobileView ? -10 : -21,
								borderTopStyle: 'dashed',
								width: 'unset',
								minWidth: 'unset',
							}}
							extraAssetInfos={addLiquidityConfig.poolAssets.map((poolAsset, index) => ({
								index,
								coinDenom: poolAsset.currency.coinDenom,
								liquidityWeightPercentage: poolAsset.weight.quo(addLiquidityConfig.totalWeight).decreasePrecision(2),
							}))}
							isSearchDisable
							isNoAmountOnList
						/>
					) : (
						<>
							<figure
								style={{ fontSize: isMobileView ? 48 : 60 }}
								className={cn(
									'c100 dark mr-2.5 md:mr-5',
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
							<h5 className="text-base md:text-xl">{currentCurrency.coinDenom.toUpperCase()}</h5>
						</>
					)}
				</div>
				<div className="flex flex-col items-end ml-6 md:ml-0 relative">
					<div className="flex items-center justify-center md:mb-2">
						<p className={`hidden md:block text-xs md:text-sm mb-0.5 md:mb-0`}>
							Available{' '}
							<span className={`text-xs md:text-sm text-primary-50`}>
								{queryBalance
									.getBalanceFromCurrency(currentCurrency)
									.trim(true)
									.shrink(true)
									.toString()}
							</span>
						</p>
						<button
							className={cn(
								'inline-block rounded-md py-1 px-1.5 bg-white-faint h-6 ml-1.25 absolute bottom-0.5 right-0.5 md:static'
							)}
							onClick={() => addLiquidityConfig.setMax()}>
							<p className="text-xs">MAX</p>
						</button>
					</div>

					<div className="bg-background px-1.5 py-0.5 rounded-lg w-full">
						<AmountInput
							type="number"
							onChange={e => {
								e.preventDefault();
								addLiquidityConfig.setAmountAt(index, e.currentTarget.value);
							}}
							value={addLiquidityConfig.poolAssetConfigs[index].amount}
						/>
					</div>
				</div>
			</section>
		</li>
	);
});

const RemoveLiquidity: FunctionComponent<{
	removeLiquidityConfig: RemoveLiquidityConfig;
	isMobileView: boolean;
}> = observer(({ removeLiquidityConfig, isMobileView }) => {
	return (
		<div className="mt-6 md:mt-15 w-full flex flex-col justify-center items-center">
			<h2 className="text-2xl md:text-4xl">
				<input
					value={removeLiquidityConfig.percentage}
					size={removeLiquidityConfig.percentage.toString().length}
					onChange={e => {
						e.preventDefault();

						removeLiquidityConfig.setPercentage(e.target.value);
					}}
				/>
				<div className="inline-block" style={{ marginLeft: isMobileView ? '-0.5rem' : '-1rem' }}>
					%
				</div>
			</h2>
			<div className="mt-4 md:mt-5 mb-7 md:mb-15 w-full">
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
					x={removeLiquidityConfig.percentage}
					onChange={({ x }) => removeLiquidityConfig.setPercentage(parseFloat(x.toFixed(2)).toString())}
				/>
			</div>
			<div className="grid grid-cols-4 gap-5 h-9 w-full mb-6 md:mb-15">
				<button
					onClick={() => removeLiquidityConfig.setPercentage('25')}
					className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75">
					<p className="text-secondary-200">25%</p>
				</button>
				<button
					onClick={() => removeLiquidityConfig.setPercentage('50')}
					className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75">
					<p className="text-secondary-200">50%</p>
				</button>
				<button
					onClick={() => removeLiquidityConfig.setPercentage('75')}
					className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75">
					<p className="text-secondary-200">75%</p>
				</button>
				<button
					onClick={() => removeLiquidityConfig.setPercentage('100')}
					className="w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75">
					<p className="text-secondary-200">100%</p>
				</button>
			</div>
		</div>
	);
});

const BottomButton: FunctionComponent<{
	tab: Tabs;
	addLiquidityConfig: AddLiquidityConfig;
	removeLiquidityConfig: RemoveLiquidityConfig;
	close: () => void;
}> = observer(({ tab, addLiquidityConfig, removeLiquidityConfig, close }) => {
	const { chainStore, accountStore } = useStore();

	const error = (() => {
		if (tab === Tabs.ADD) {
			return addLiquidityConfig.getError();
		}
	})();

	const account = accountStore.getAccount(chainStore.current.chainId);

	return (
		<React.Fragment>
			{error && (
				<div className="mt-4 md:mt-6 w-full flex justify-center items-center">
					<div className="py-1.5 px-2.5 md:px-3.5 rounded-lg bg-missionError flex justify-center items-center">
						<img className="h-5 w-5 mr-2.5" src="/public/assets/Icons/Info-Circle.svg" />
						<p>{error.message}</p>
					</div>
				</div>
			)}
			<div className="mt-8 w-full flex items-center justify-center">
				<button
					disabled={!account.isReadyToSendMsgs || error != null}
					className="w-full md:w-2/3 h-12 md:h-15 bg-primary-200 rounded-xl md:rounded-2xl flex justify-center items-center hover:opacity-75 cursor-pointer disabled:opacity-50"
					onClick={async e => {
						e.preventDefault();

						if (account.isReadyToSendMsgs) {
							if (tab === Tabs.ADD) {
								if (addLiquidityConfig.isSingleAmountIn && addLiquidityConfig.singleAmountInConfig) {
									try {
										// XXX: 일단 이 경우 슬리피지를 2.5%로만 설정한다.
										await account.osmosis.sendJoinSwapExternAmountInMsg(
											addLiquidityConfig.poolId,
											{
												amount: addLiquidityConfig.singleAmountInConfig.amount,
												currency: addLiquidityConfig.singleAmountInConfig.currency,
											},
											'2.5',
											'',
											() => {
												close();
											}
										);
									} catch (e) {
										console.log(e);
									}
								} else {
									const shareOutAmount = addLiquidityConfig.shareOutAmount;
									if (!shareOutAmount) {
										return;
									}

									try {
										// XXX: 일단 이 경우 슬리피지를 2.5%로만 설정한다.
										await account.osmosis.sendJoinPoolMsg(
											addLiquidityConfig.poolId,
											shareOutAmount.toDec().toString(),
											'2.5',
											'',
											() => {
												close();
											}
										);
									} catch (e) {
										console.log(e);
									}
								}
							}

							// TODO: 트랜잭션을 보낼 준비가 안됐으면 버튼을 disabled 시키기
							if (tab === Tabs.REMOVE) {
								const shareIn = removeLiquidityConfig.poolShareWithPercentage;

								// XXX: 일단 이 경우 슬리피지를 2.5%로만 설정한다.
								try {
									await account.osmosis.sendExitPoolMsg(
										removeLiquidityConfig.poolId,
										shareIn.toDec().toString(),
										'2.5',
										'',
										() => {
											close();
										}
									);
								} catch (e) {
									console.log(e);
								}
							}
						}
					}}>
					{tab === Tabs.ADD ? (
						account.isSendingMsg === 'joinPool' ? (
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
							<p className="text-white-high font-semibold text-base md:text-lg">Add Liquidity</p>
						)
					) : account.isSendingMsg === 'exitPool' ? (
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
						<p className="text-white-high font-semibold text-base md:text-lg">Remove Liquidity</p>
					)}
				</button>
			</div>
		</React.Fragment>
	);
});
