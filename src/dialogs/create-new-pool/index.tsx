import React, { FunctionComponent, useState } from 'react';
import cn from 'clsx';
import { NewPoolStage1 } from './Step1';
import { NewPoolStage2 } from './Step2';
import { NewPoolStage3 } from './Step3';
import { observer } from 'mobx-react-lite';
import { Img } from '../../components/common/Img';
import { BaseDialog, BaseModalProps } from '../base';
import { ObservableQueryBalances } from '@keplr-wallet/stores/build/query/balances';
import { AppCurrency } from '@keplr-wallet/types';
import { action, computed, makeObservable, observable } from 'mobx';
import { useStore } from '../../stores';
import { Dec } from '@keplr-wallet/unit';

export class CreateNewPoolState {
	@observable
	protected _sender: string;

	@observable.ref
	protected _queryBalances: ObservableQueryBalances;

	@observable.shallow
	protected _assets: {
		currency: AppCurrency;
		percentage: string;
		amount: string;
	}[] = [];

	constructor(sender: string, queryBalances: ObservableQueryBalances) {
		this._sender = sender;
		this._queryBalances = queryBalances;

		makeObservable(this);
	}

	get assets(): {
		currency: AppCurrency;
		percentage: string;
		amount: string;
	}[] {
		return this._assets;
	}

	@action
	addAsset(currency: AppCurrency) {
		this._assets.push({
			currency,
			percentage: '0',
			amount: '0',
		});
	}

	@action
	setAssetCurrencyAt(index: number, currency: AppCurrency) {
		this.assets[index] = {
			...this.assets[index],
			currency,
		};
	}

	@action
	setAssetPercentageAt(index: number, percentage: string) {
		if (percentage === '') {
			percentage = '0';
		}

		try {
			const dec = new Dec(percentage);
			if (dec.lt(new Dec(0))) {
				return;
			}
		} catch {
			// noop
		}

		this.assets[index] = {
			...this.assets[index],
			percentage,
		};
	}

	@action
	setAssetAmountAt(index: number, amount: string) {
		if (amount === '') {
			amount = '0';
		}

		if (amount.startsWith('.')) {
			amount = '0' + amount;
		}

		try {
			const dec = new Dec(amount);
			if (dec.lt(new Dec(0))) {
				return;
			}
		} catch {
			// noop
		}

		this.assets[index] = {
			...this.assets[index],
			amount,
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
	}

	get queryBalances(): ObservableQueryBalances {
		return this._queryBalances;
	}

	@action
	setQueryBalances(queryBalances: ObservableQueryBalances) {
		this._queryBalances = queryBalances;
	}

	get sendableCurrencies(): AppCurrency[] {
		return this._queryBalances.getQueryBech32Address(this._sender).positiveBalances.map(bal => {
			return bal.currency;
		});
	}

	/**
	 * sendableCurrencies 중에서 현재 assets에 없는 currency들을 반환한다.
	 */
	get remainingSelectableCurrencies(): AppCurrency[] {
		const sendable = this.sendableCurrencies;
		const assets = this.assets;

		return sendable.filter(cur => {
			return assets.find(asset => asset.currency.coinMinimalDenom === cur.coinMinimalDenom) == null;
		});
	}

	@computed
	get error(): Error | undefined {
		if (this.assets.length < 2) {
			return new Error('At least, 2 assets needed');
		}
		if (this.assets.length > 8) {
			return new Error('Too many asset');
		}

		let totalPercentage = new Dec(0);
		for (const asset of this.assets) {
			const percentage = new Dec(asset.percentage);

			if (percentage.lte(new Dec(0))) {
				return new Error('Non-positive percentage');
			}

			totalPercentage = totalPercentage.add(percentage);
		}
		if (!totalPercentage.equals(new Dec(100))) {
			return new Error('Sum of percentages is not 100%');
		}

		if (this.assets.find(asset => new Dec(asset.amount).lte(new Dec(0)))) {
			return new Error('Non-positive asset');
		}
	}
}

export const CreateNewPoolDialog: FunctionComponent<BaseModalProps> = observer(({ isOpen, close, style }) => {
	const { chainStore, accountStore, queriesStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const [state] = useState(() => new CreateNewPoolState(account.bech32Address, queries.queryBalances));
	state.setSender(account.bech32Address);
	state.setQueryBalances(queries.queryBalances);

	const [stage, setStage] = useState(1);

	const content = (() => {
		if (stage === 1) return <NewPoolStage1 state={state} />;
		else if (stage === 2) return <NewPoolStage2 state={state} />;
		else if (stage === 3) return <NewPoolStage3 state={state} />;
	})();
	return (
		<BaseDialog style={style} isOpen={isOpen} close={close}>
			<div style={style} className="text-white-high w-full">
				<div>{content}</div>
				<div className="flex flex-col items-center w-full">
					<NewPoolButton close={close} state={state} stage={stage} setStage={setStage} />
				</div>
			</div>
		</BaseDialog>
	);
});

const NewPoolButton: FunctionComponent<{
	state: CreateNewPoolState;
	stage: number;
	setStage: (value: number | ((prev: number) => number)) => void;
	close: () => void;
}> = observer(({ state, stage, setStage, close }) => {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);

	const error = (() => {
		const error = state.error;
		if (error && stage === 1) {
			// Stage 1에서는 balance 관련 오류는 무시한다.
			if (error.message.includes('Non-positive asset')) {
				return undefined;
			}
		}

		return error;
	})();

	const onNextClick = () => {
		// data validation process
		if (error) return;

		if (stage === 3) {
			if (!account.isReadyToSendMsgs) {
				return;
			}

			// TODO: Swap Fee 설정하는 단계 만들기. 일단은 0.5%로 만든다.
			account.osmosis.sendCreatePoolMsg(
				'0.5',
				state.assets.map(asset => {
					return {
						// Weight는 체인 상에서 알아서 더 큰 값으로 설정되기 때문에 일단은 대충 설정해서 만든다.
						weight: asset.percentage,
						token: {
							amount: asset.amount,
							currency: asset.currency,
						},
					};
				})
			);

			close();
			return;
		}

		setStage(prev => prev + 1);
	};

	return (
		<React.Fragment>
			{error && (
				<div className="mt-6 mb-7.5 w-full flex justify-center items-center">
					<div className="py-1.5 px-3.5 rounded-lg bg-missionError flex justify-center items-center">
						<Img className="h-5 w-5 mr-2.5" src="/public/assets/Icons/Info-Circle.svg" />
						<p>{error.message}</p>
					</div>
				</div>
			)}
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
						onClick={onNextClick}
						className={cn(
							'h-full rounded-2xl bg-primary-200 flex items-center justify-center mx-auto hover:opacity-75',
							stage > 1 ? 'w-full' : 'w-2/3'
						)}>
						<h6>{stage < 3 ? 'Next' : 'Create Pool'}</h6>
					</button>
				</div>
			</div>
		</React.Fragment>
	);
});
