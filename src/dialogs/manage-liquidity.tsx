import React, { Dispatch, FunctionComponent, SetStateAction, useState } from 'react';
import { BaseDialog, BaseModalProps } from './base';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import InputSlider from 'react-input-slider';
import { useStore } from '../stores';
import { action, makeObservable, observable } from 'mobx';
import { Dec, DecUtils } from '@keplr-wallet/unit';

enum Tabs {
	ADD,
	REMOVE,
}

export class RemoveLiquidityState {
	@observable
	protected _poolId: string;

	@observable
	protected _percentage: string;

	constructor(poolId: string, initialPercentage: string) {
		this._poolId = poolId;
		this._percentage = initialPercentage;

		makeObservable(this);
	}

	get poolId(): string {
		return this._poolId;
	}

	@action
	setPoolId(poolId: string) {
		this._poolId = poolId;
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
}

export const ManageLiquidityDialog: FunctionComponent<BaseModalProps & {
	poolId: string;
}> = observer(({ isOpen, close, poolId }) => {
	const [tab, setTab] = React.useState<Tabs>(Tabs.ADD);

	const [removeLiquidityState] = useState(() => new RemoveLiquidityState(poolId, '35'));
	removeLiquidityState.setPoolId(poolId);

	return (
		<BaseDialog isOpen={isOpen} close={close}>
			<div className="text-white-high">
				<h5 className="mb-9">Manage Liquidity</h5>
				<div className="mb-7.5">
					<AddRemoveSelectTab setTab={setTab} tab={tab} />
				</div>
				{tab === Tabs.ADD ? <div>TODO</div> : <RemoveLiquidity removeLiquidityState={removeLiquidityState} />}
				<BottomButton tab={tab} removeLiquidityState={removeLiquidityState} />
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
	removeLiquidityState: RemoveLiquidityState;
}> = observer(({ tab, removeLiquidityState }) => {
	const { chainStore, queriesStore, accountStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	return (
		<div className="w-full flex items-center justify-center">
			<button
				className="w-2/3 h-15 bg-primary-200 rounded-2xl flex justify-center items-center hover:opacity-75 cursor-pointer"
				onClick={e => {
					e.preventDefault();

					// TODO: 트랜잭션을 보낼 준비가 안됐으면 버튼을 disabled 시키
					if (tab === Tabs.REMOVE && account.isReadyToSendMsgs) {
						const percentage = removeLiquidityState.percentage;
						const poolShare = queries.osmosis.queryGammPoolShare.getGammShare(
							account.bech32Address,
							removeLiquidityState.poolId
						);

						const shareInAmount = poolShare.mul(new Dec(percentage).quo(DecUtils.getPrecisionDec(2)));

						// XXX: 일단 이 경우 슬리피지를 2.5%로만 설정한다.
						// TODO: 트랜잭션을 보내는 중일때 버튼에 로딩 표시(?)
						account.osmosis.sendExitPoolMsg(
							removeLiquidityState.poolId,
							shareInAmount.hideDenom(true).toString(),
							'2.5'
						);
					}
				}}>
				<p className="text-white-high font-semibold text-lg">{`${tab === Tabs.ADD ? 'Add' : 'Remove'} Liquidity`}</p>
			</button>
		</div>
	);
});
