import React, { FunctionComponent, useState } from 'react';
import cn from 'clsx';
import { NewPoolStage1 } from './Step1';
import { NewPoolStage2 } from './Step2';
import { NewPoolStage3 } from './Step3';
import { observer } from 'mobx-react-lite';
import { wrapBaseDialog } from '../base';
import { AppCurrency } from '@keplr-wallet/types';
import { action, makeObservable, observable, override } from 'mobx';
import { useStore } from '../../stores';
import { Dec, DecUtils } from '@keplr-wallet/unit';
import { IFeeConfig, TxChainSetter } from '@keplr-wallet/hooks';
import { BasicAmountConfig } from '../../hooks/tx/basic-amount-config';
import { ChainGetter, ObservableQueryBalances } from '@keplr-wallet/stores';
import { useFakeFeeConfig } from '../../hooks/tx';
import { computedFn } from 'mobx-utils';

export class CreateNewPoolConfig extends TxChainSetter {
	@observable
	protected _sender: string;

	@observable.ref
	protected _feeConfig: IFeeConfig | undefined = undefined;

	@observable.ref
	protected _queryBalances: ObservableQueryBalances;

	@observable.shallow
	protected _assets: {
		percentage: string;
		amountConfig: BasicAmountConfig;
	}[] = [];

	@observable
	protected _swapFee: string = '0';

	constructor(
		chainGetter: ChainGetter,
		initialChainId: string,
		sender: string,
		queryBalances: ObservableQueryBalances
	) {
		super(chainGetter, initialChainId);

		this._sender = sender;
		this._queryBalances = queryBalances;

		makeObservable(this);
	}

	@override
	setChain(chainId: string) {
		super.setChain(chainId);

		for (const asset of this.assets) {
			asset.amountConfig.setChain(chainId);
		}
	}

	@action
	setFeeConfig(feeConfig: IFeeConfig) {
		this._feeConfig = feeConfig;

		for (const asset of this.assets) {
			asset.amountConfig.setFeeConfig(feeConfig);
		}
	}

	get feeConfig(): IFeeConfig | undefined {
		return this._feeConfig;
	}

	get assets(): {
		percentage: string;
		amountConfig: BasicAmountConfig;
	}[] {
		return this._assets;
	}

	@action
	addAsset(currency: AppCurrency) {
		const config = new BasicAmountConfig(this.chainGetter, this.chainId, this.sender, currency, this.queryBalances);
		if (this.feeConfig) {
			config.setFeeConfig(this.feeConfig);
		}

		this._assets.push({
			percentage: '',
			amountConfig: config,
		});
	}

	@action
	setAssetPercentageAt(index: number, percentage: string) {
		if (percentage.startsWith('.')) {
			percentage = '0' + percentage;
		}

		this.assets[index] = {
			...this.assets[index],
			percentage,
		};
	}

	@action
	removeAssetAt(index: number) {
		this._assets.splice(index, 1);
	}

	get sender(): string {
		return this._sender;
	}

	@action
	setSender(sender: string) {
		this._sender = sender;

		for (const asset of this.assets) {
			asset.amountConfig.setSender(sender);
		}
	}

	get queryBalances(): ObservableQueryBalances {
		return this._queryBalances;
	}

	@action
	setQueryBalances(queryBalances: ObservableQueryBalances) {
		this._queryBalances = queryBalances;

		for (const asset of this.assets) {
			asset.amountConfig.setQueryBalances(queryBalances);
		}
	}

	get sendableCurrencies(): AppCurrency[] {
		return this._queryBalances.getQueryBech32Address(this._sender).positiveBalances.map(bal => {
			return bal.currency;
		});
	}

	get swapFee(): string {
		return this._swapFee;
	}

	@action
	setSwapFee(swapFee: string): void {
		this._swapFee = swapFee;
	}

	/**
	 * sendableCurrencies 중에서 현재 assets에 없는 currency들을 반환한다.
	 */
	get remainingSelectableCurrencies(): AppCurrency[] {
		const sendable = this.sendableCurrencies;
		const assets = this.assets;

		return sendable.filter(cur => {
			return assets.find(asset => asset.amountConfig.currency.coinMinimalDenom === cur.coinMinimalDenom) == null;
		});
	}

	readonly getErrorOfPercentage = computedFn(() => {
		if (this.assets.length < 2) {
			return new Error('Minimum of 2 assets required');
		}
		if (this.assets.length > 8) {
			return new Error('Too many assets');
		}

		let totalPercentage = new Dec(0);
		for (const asset of this.assets) {
			try {
				const percentage = new Dec(asset.percentage);

				if (percentage.lte(new Dec(0))) {
					return new Error('Non-positive percentage');
				}

				totalPercentage = totalPercentage.add(percentage);
			} catch {
				return new Error('Invalid form of number');
			}
		}
		if (!totalPercentage.equals(new Dec(100))) {
			return new Error('Sum of percentages is not 100%');
		}

		try {
			const dec = new Dec(this.swapFee);
			if (dec.lt(new Dec(0))) {
				return new Error('Negative swap fee');
			}
			if (dec.gte(new Dec(100))) {
				return new Error('Too much swap fee');
			}
		} catch {
			return new Error('Invalid form of swap fee');
		}
	});

	readonly getErrorOfAmount = computedFn(() => {
		for (const asset of this.assets) {
			const error = asset.amountConfig.getError();
			if (error != null) {
				return error;
			}
		}
	});
}

export const useCreateNewPoolConfig = (
	chainGetter: ChainGetter,
	chainId: string,
	sender: string,
	queryBalances: ObservableQueryBalances
) => {
	const [config] = useState(() => new CreateNewPoolConfig(chainGetter, chainId, sender, queryBalances));
	config.setChain(chainId);
	config.setQueryBalances(queryBalances);
	config.setSender(sender);

	return config;
};

export const CreateNewPoolDialog = wrapBaseDialog(
	observer(({ close }: { close: () => void }) => {
		const { chainStore, accountStore, queriesStore } = useStore();
		const account = accountStore.getAccount(chainStore.current.chainId);
		const queries = queriesStore.get(chainStore.current.chainId);

		const config = useCreateNewPoolConfig(
			chainStore,
			chainStore.current.chainId,
			account.bech32Address,
			queries.queryBalances
		);
		const feeConfig = useFakeFeeConfig(chainStore, chainStore.current.chainId, account.msgOpts.createPool.gas);
		config.setFeeConfig(feeConfig);

		const [stage, setStage] = useState(1);

		const content = (() => {
			if (stage === 1) return <NewPoolStage1 config={config} close={close} />;
			else if (stage === 2) return <NewPoolStage2 config={config} close={close} />;
			else if (stage === 3) return <NewPoolStage3 config={config} close={close} />;
		})();
		return (
			<div className="text-white-high w-full">
				<div>{content}</div>
				<div className="flex flex-col items-center w-full">
					<NewPoolButton close={close} config={config} stage={stage} setStage={setStage} />
				</div>
			</div>
		);
	})
);

const NewPoolButton: FunctionComponent<{
	config: CreateNewPoolConfig;
	stage: number;
	setStage: (value: number | ((prev: number) => number)) => void;
	close: () => void;
}> = observer(({ config, stage, setStage, close }) => {
	const { chainStore, accountStore, queriesStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const queryPoolCreationFee = queries.osmosis.queryPoolCreationFee;

	const [isPoolCreationFeeChecked, setIsPoolCreationFeeChecked] = useState(false);

	const error = (() => {
		if (stage === 1) {
			return config.getErrorOfPercentage();
		}
		return config.getErrorOfAmount() || config.getErrorOfPercentage();
	})();

	const onNextClick = async () => {
		// data validation process
		if (error) return;

		if (stage === 3) {
			if (!account.isReadyToSendMsgs) {
				return;
			}

			try {
				await account.osmosis.sendCreatePoolMsg(
					config.swapFee,
					config.assets.map(asset => {
						return {
							// Weight는 체인 상에서 알아서 더 큰 값으로 설정되기 때문에 일단은 대충 설정해서 만든다.
							// 소수점일 경우도 있기 때문에 10^4을 곱한다.
							weight: new Dec(asset.percentage)
								.mul(DecUtils.getPrecisionDec(4))
								.truncate()
								.toString(),
							token: {
								amount: asset.amountConfig.amount,
								currency: asset.amountConfig.currency,
							},
						};
					}),
					'',
					() => {
						close();
					}
				);
			} catch (e) {
				console.log(e);
			}

			return;
		}

		setStage(prev => prev + 1);
	};

	return (
		<React.Fragment>
			{error && (
				<div className="mt-6 mb-7.5 w-full flex justify-center items-center">
					<div className="py-1.5 px-3.5 rounded-lg bg-missionError flex justify-center items-center">
						<img className="h-5 w-5 mr-2.5" src="/public/assets/Icons/Info-Circle.svg" />
						<p>{error.message}</p>
					</div>
				</div>
			)}
			{stage === 3 ? (
				<div className="flex flex-row justify-center items-center mt-5">
					<input
						className="mr-2"
						type="checkbox"
						checked={isPoolCreationFeeChecked}
						onChange={() => {
							setIsPoolCreationFeeChecked(value => !value);
						}}
					/>
					<p
						className="text-base text-white-high font-medium cursor-pointer"
						onClick={() => {
							setIsPoolCreationFeeChecked(value => !value);
						}}>{`I understand that creating a new pool will cost ${queryPoolCreationFee.poolCreationFee
						.map(fee =>
							fee
								.trim(true)
								.maxDecimals(6)
								.toString()
						)
						.join(',')}`}</p>
				</div>
			) : null}
			<div className="flex items-center justify-center w-full">
				<div className={cn('mt-7.5 h-15 gap-4 flex items-center justify-center', stage > 1 ? 'w-4/5' : 'w-full')}>
					{stage > 1 && (
						<button
							onClick={() => setStage(prev => prev - 1)}
							className="w-1/3 h-full rounded-2xl bg-secondary-200 flex items-center justify-center mx-auto hover:opacity-75">
							<h6>Back</h6>
						</button>
					)}
					<button
						disabled={
							!account.isReadyToSendMsgs ||
							error != null ||
							!queryPoolCreationFee.response ||
							queryPoolCreationFee.response.staled ||
							(stage === 3 && !isPoolCreationFeeChecked)
						}
						onClick={onNextClick}
						className={cn(
							'h-full rounded-2xl bg-primary-200 flex items-center justify-center mx-auto hover:opacity-75 disabled:opacity-50',
							stage > 1 ? 'w-full' : 'w-2/3'
						)}>
						<h6>
							{stage < 3 ? (
								'Next'
							) : account.isSendingMsg === 'createPool' ? (
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
								'Create Pool'
							)}
						</h6>
					</button>
				</div>
			</div>
		</React.Fragment>
	);
});
