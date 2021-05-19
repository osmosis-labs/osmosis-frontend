import React, { FunctionComponent, useState } from 'react';
import cn from 'clsx';
import { NewPoolStage1 } from './Step1';
// import { NewPoolStage2 } from './Step2';
// import { NewPoolStage3 } from './Step3';
import { observer } from 'mobx-react-lite';
import { Img } from '../../components/common/Img';
import { BaseDialog, BaseModalProps } from '../base';
import { ObservableQueryBalances } from '@keplr-wallet/stores/build/query/balances';
import { AppCurrency } from '@keplr-wallet/types';
import { action, computed, makeObservable, observable } from 'mobx';
import { useStore } from '../../stores';

export class CreateNewPoolState {
	@observable
	protected _sender: string;

	@observable.ref
	protected _queryBalances: ObservableQueryBalances;

	@observable.shallow
	protected _assets: {
		currency: AppCurrency;
		percentage: string;
	}[] = [];

	constructor(sender: string, queryBalances: ObservableQueryBalances) {
		this._sender = sender;
		this._queryBalances = queryBalances;

		makeObservable(this);
	}

	get assets(): {
		currency: AppCurrency;
		percentage: string;
	}[] {
		return this._assets;
	}

	@action
	addAsset(currency: AppCurrency, percentage: string) {
		this._assets.push({
			currency,
			percentage,
		});
	}

	@action
	setAssetAt(index: number, currency: AppCurrency, percentage: string) {
		this.assets[index] = {
			currency,
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
	get error(): Error {
		return new Error('TODO');
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

	const content = React.useMemo(() => {
		if (stage === 1) return <NewPoolStage1 state={state} />;
		/*
		else if (stage === 2) return <NewPoolStage2 state={state} />;
		else if (stage === 3) return <NewPoolStage3 state={state} />;
		 */
	}, [state]);
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
	const onNextClick = () => {
		// data validation process
		if (state.error) return;

		if (stage === 3) {
			alert('Generated Pools!');
			close();
			return;
		}

		setStage(prev => prev + 1);
	};

	return (
		<React.Fragment>
			{state.error && (
				<div className="mt-6 mb-7.5 w-full flex justify-center items-center">
					<div className="py-1.5 px-3.5 rounded-lg bg-missionError flex justify-center items-center">
						<Img className="h-5 w-5 mr-2.5" src="/public/assets/Icons/Info-Circle.svg" />
						<p>{state.error.message}</p>
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
