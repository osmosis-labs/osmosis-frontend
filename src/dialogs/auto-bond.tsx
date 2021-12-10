import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty } from '@keplr-wallet/unit';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import React, { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from 'react';
import { SimpleSwitch } from 'src/components/form/Inputs';
import { OsmosisSpinner } from 'src/components/Spinners';
import { AutoBondFromBox } from 'src/components/SwapToken/AutoBondFromBox';
import { useIbcBalances } from 'src/hooks/account/ibs';
import { Process, Step, StepUpdate, useProcess } from 'src/hooks/process';
import { useFakeFeeConfig } from 'src/hooks/tx';
import useWindowSize from 'src/hooks/useWindowSize';
import { PersistenceData, useLocalStoragePersistence } from 'src/hooks/utils/local-persistence';
import { PoolSwapConfig, usePoolSwapConfig } from 'src/pages/pool/components/PoolInfoHeader/usePoolSwapConfig';
import { StateRef } from 'src/types/react';
import { AddLiquidityConfig, LockupItem } from '.';
import { ProcessTracker } from '../components/common/ProcessTracker';
import { useStore } from '../stores';
import { depositIbc, performAutoBondProcess } from './auto-bond/perform';
import { wrapBaseDialog } from './base';

export const AutoBondDialog = wrapBaseDialog(
	observer(({ poolId, close }: { poolId: string; close: () => void }) => {
		const process = useProcess();
		const { chainStore, queriesStore, accountStore, ibcTransferHistoryStore } = useStore();
		const { isMobileView } = useWindowSize();
		const { localStorage, setLocalStorage, useLocalStorageState } = useLocalStoragePersistence('auto-bond');

		const queries = queriesStore.get(chainStore.current.chainId);
		const account = accountStore.getAccount(chainStore.current.chainId);
		// const pool = useMemo(
		// 	() => queries.osmosis.queryGammPools.getObservableQueryPool(poolId), //
		// 	[poolId, queries.osmosis.queryGammPools]
		// );

		// IBC Config
		const [ibcSelection, setIbcSelection] = useLocalStorageState([poolId, 'ibc'], [] as AppCurrency[], {
			serialize: list => {
				console.debug(
					'ser',
					list.map(c => c.coinDenom)
				);
				return list.map(c => c.coinDenom);
			},
			deserialize: (list: string[]) =>
				list && list.map((denom: string) => chainStore.getChain(chainStore.current.chainId).forceFindCurrency(denom)),
		});

		// Auto swap Config
		const swapConfig = usePoolSwapConfig(
			chainStore,
			chainStore.current.chainId,
			account.bech32Address,
			queries.queryBalances,
			poolId,
			queries.osmosis.queryGammPools
		);
		const swapFeeConfig = useFakeFeeConfig(
			chainStore,
			chainStore.current.chainId,
			account.msgOpts.swapExactAmountIn.gas
		);
		swapConfig.setFeeConfig(swapFeeConfig);
		useEffect(() => {
			/* swapConfig.setInCurrency(); */ swapConfig.setIsMax(true);
		}, [swapConfig]); // in the beginning, set to max
		usePersistCurrencyChoice(swapConfig, poolId, localStorage, setLocalStorage);

		// Auto-calculation hooks
		const [matchWithOther, setMatchWithOther] = useLocalStorageState([poolId, 'matchWithOther'], false);
		const [allIn, setAllIn] = useLocalStorageState([poolId, 'allIn'], false);

		// Join pool Config
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

		// Lock LP token config
		const [selectedDurationIndex, setSelectedDurationIndex] = useLocalStorageState([poolId, 'lockDuration'], 0);
		const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

		// Balances
		const [balanceIn, balanceOut] = [swapConfig.sendCurrency, swapConfig.outCurrency].map(c =>
			queries.queryBalances.getQueryBech32Address(account.bech32Address).getBalanceFromCurrency(c)
		);

		const error = swapConfig.getError();
		return (
			<div className="text-white-high w-full h-full">
				<h5 className="text-lg md:text-xl mb-5 md:mb-9">AutoBond</h5>
				<div className="flex justify-center">
					<div className="w-full">
						{!process.active && !process.steps.length ? (
							<>
								<IbcSelect currencies={swapConfig.sendableCurrencies} selection={[ibcSelection, setIbcSelection]} />
								<AmountSelect
									{...{
										config: swapConfig,
										matchWithOther,
										setMatchWithOther,
										allIn,
										setAllIn,
										balanceOut,
										ibcSelection,
										setIbcSelection,
									}}
								/>
								<LockupSelect {...{ poolId, selectedDurationIndex, setSelectedDurationIndex }} />
								<BottomButton
									swapConfig={swapConfig}
									addLiquidityConfig={addLiquidityConfig}
									startProcess={() => {
										if (process.active) return;
										console.log('AutoBond process start', { ready: account.isReadyToSendMsgs, error });
										if (!account.isReadyToSendMsgs || error != null) return;
										performAutoBondProcess(
											process,
											accountStore,
											queriesStore,
											chainStore,
											ibcTransferHistoryStore,
											ibcSelection,
											swapConfig,
											swapFeeConfig,
											addLiquidityConfig,
											lockableDurations[selectedDurationIndex],
											allIn,
											matchWithOther
										).catch((err: Error) => console.error('AutoBond process error', err));
									}}
									error={error}
								/>
							</>
						) : (
							<>
								<div className="flex flex-col items-center">
									<div className="bg-card rounded-2xl p-4 flex flex-col items-center">
										{process.active ? <OsmosisSpinner /> : null}
										<ProcessTracker process={process} />
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		);
	})
);

const IbcSelect: FunctionComponent<{
	currencies: AppCurrency[] | undefined;
	selection: StateRef<AppCurrency[]>;
}> = observer(({ currencies, ...state }) => {
	const [selection, setSelection] = state.selection;
	const [interactedWith, setInteractedWith] = useState<AppCurrency[]>([]); // if a user touched it, don't just remove it from display

	if (!currencies) return null;
	const ibcBalances = useIbcBalances(currencies);
	const positiveOrTouchedBalances = ibcBalances.filter(
		balance =>
			!balance?.accInitialized ||
			interactedWith.includes(balance.balance.currency) || // if a user touched it, keep it in display
			balance.balance.toDec().isPositive()
	);
	console.log(
		'ibcBalances',
		_.fromPairs(ibcBalances.map(bal => [bal?.balance.toString(), bal?.balance.toDec().isPositive()]))
	);
	// remove from selection when without balance - has UX artifacts inbetween accInitialised=true & new balance
	// useEffect(() =>
	// 	selection.forEach(currency => {
	// 		const balance = _.find(ibcBalances, c => c.balance.denom == currency.coinDenom);
	// 		if (balance?.accInitialized && !balance.balance.toDec().isPositive()) {
	// 			console.debug('removing because empty:', currency.coinDenom);
	// 			setSelection(_.without(selection, currency));
	// 		}
	// 	})
	// );

	if (!positiveOrTouchedBalances.length) return null;
	return (
		<div className="bg-card rounded-2xl p-4 mb-4">
			<p>0. Deposit via IBC (optional):</p>
			<div className="mt-2 flex">
				{positiveOrTouchedBalances.map(balance => {
					const currency = balance.balance.currency;
					const disabled = balance?.accInitialized && !balance.balance.toDec().isPositive();
					return (
						<SimpleSwitch
							key={balance.balance.denom}
							className={'text-sm -mb-2'}
							checked={!disabled && !!_.find(selection, c => c.coinDenom == balance.balance.denom)}
							onChecked={flag => {
								if (disabled) return;
								if (!balance?.accInitialized) balance?.initAcc();
								setInteractedWith(list => _.union(list, [currency])); // if a user touched it, don't just remove it from display
								console.log('toggle:', flag, _.map(selection, 'coinDenom'), balance.balance.denom);
								setSelection(
									flag ? _.union(selection, [currency]) : _.filter(selection, c => c.coinDenom != balance.balance.denom)
								);
							}}
							disabled={disabled}>
							{balance?.accInitialized ? (
								balance?.balance.toString()
							) : (
								<span className="cursor-help underline" onClick={balance.initAcc}>
									?{balance?.balance.denom}
								</span>
							)}
						</SimpleSwitch>
					);
				})}
			</div>
		</div>
	);
});
const AmountSelect: FunctionComponent<{
	config: PoolSwapConfig;
	matchWithOther: boolean;
	setMatchWithOther: Dispatch<SetStateAction<boolean>>;
	allIn: boolean;
	setAllIn: Dispatch<SetStateAction<boolean>>;
	balanceOut: CoinPretty | undefined;
	ibcSelection: AppCurrency[];
	setIbcSelection: Dispatch<SetStateAction<string[]>>;
}> = observer(
	({ config, matchWithOther, setMatchWithOther, allIn, setAllIn, balanceOut, ibcSelection, setIbcSelection }) => {
		const { isMobileView } = useWindowSize();
		const { chainStore, queriesStore, accountStore, priceStore, ibcTransferHistoryStore } = useStore();

		const showMatchWithOther = balanceOut?.toDec().isPositive();

		return (
			<div className="bg-card rounded-2xl p-4 mb-4">
				<p>1. Choose input:</p>
				<SimpleSwitch checked={allIn} onChecked={setAllIn}>
					All-in with both currencies
				</SimpleSwitch>

				{allIn ? null : ibcSelection.length ? (
					<button
						className="p-1 px-3 rounded-md bg-primary-200 font-semibold"
						onClick={async () => {
							await depositIbc(
								{
									trackStep: (step: Step, func: (updateStep: (update: StepUpdate) => void) => Promise<void>) =>
										func(() => {}),
								} as Process, // fake process
								ibcSelection,
								accountStore,
								queriesStore,
								ibcTransferHistoryStore,
								chainStore
							);
							setIbcSelection([]);
						}}>
						perform IBC now (to get balances)
					</button>
				) : (
					<>
						<div className="mt-2">
							<AutoBondFromBox {...{ config }} dropdownStyle={isMobileView ? { width: 'calc(100vw - 72px)' } : {}} />
						</div>
						{showMatchWithOther ? (
							<SimpleSwitch className="text-sm -mb-2" checked={matchWithOther} onChecked={setMatchWithOther}>
								use available {config.outCurrency.coinDenom} (less swapping, but resulting bond might double in total
								value)
							</SimpleSwitch>
						) : balanceOut?.toDec().isPositive() ? (
							<p className="pt-2">partially auto-swapped to {config.outCurrency.coinDenom}</p>
						) : null}
					</>
				)}
			</div>
		);
	}
);

const LockupSelect: FunctionComponent<{
	poolId: string;
	selectedDurationIndex: number;
	setSelectedDurationIndex: React.Dispatch<React.SetStateAction<number>>;
}> = observer(({ poolId, selectedDurationIndex, setSelectedDurationIndex }) => {
	const { isMobileView } = useWindowSize();
	const { chainStore, queriesStore, accountStore, priceStore } = useStore();
	const queries = queriesStore.get(chainStore.current.chainId);
	const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

	return (
		<div className="bg-card rounded-2xl p-4">
			<p style={{ marginBottom: isMobileView ? 12 : 18 }}>2. Select Lockup period</p>
			<ul className="flex flex-col gap-2.5 md:flex-row md:gap-9">
				{lockableDurations.map((duration, i) => {
					return (
						<LockupItem
							key={i.toString()}
							duration={duration.humanize()}
							setSelected={() => {
								setSelectedDurationIndex(i);
							}}
							selected={i === selectedDurationIndex}
							apy={`${queries.osmosis.queryIncentivizedPools
								.computeAPY(poolId, duration, priceStore, priceStore.getFiatCurrency('usd')!)
								.toString()}%`}
						/>
					);
				})}
			</ul>
		</div>
	);
});

const BottomButton: FunctionComponent<{
	swapConfig: PoolSwapConfig;
	addLiquidityConfig: AddLiquidityConfig;
	startProcess: () => void;
	error: Error | undefined;
}> = observer(({ swapConfig, addLiquidityConfig, startProcess, error }) => {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);

	return (
		<React.Fragment>
			{error && (
				<div className="mb-3.5 md:mt-6 md:mb-7.5 w-full flex justify-center items-center">
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
						startProcess();
					}}>
					<p className="text-white-high font-semibold text-base md:text-lg">AutoBond</p>
				</button>
			</div>
		</React.Fragment>
	);
});

function usePersistCurrencyChoice(
	swapConfig: PoolSwapConfig,
	poolId: string,
	persistence: PersistenceData,
	setPersistence: Dispatch<SetStateAction<PersistenceData | undefined>>
) {
	// Load previous currency from persistence
	useEffect(() => {
		if (_.get(persistence, [poolId, 'currency']) === swapConfig.outCurrency.coinDenom) {
			swapConfig.switchInAndOut();
			swapConfig.setIsMax(true);
		}
	}, [persistence, poolId, swapConfig]);
	// Save selected currency to persistence
	useEffect(() => {
		if (_.get(persistence, [poolId, 'currency']) !== swapConfig.sendCurrency.coinDenom) {
			setPersistence(p => {
				return _.set(p ?? {}, [poolId, 'currency'], swapConfig.sendCurrency.coinDenom);
			});
		}
	}, [swapConfig.sendCurrency.coinDenom, poolId, persistence, setPersistence]);
}
