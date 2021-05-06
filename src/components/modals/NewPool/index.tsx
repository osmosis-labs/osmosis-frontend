import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { NewPoolStage1 } from './Step1';
import { sumArray } from '../../../utils/Big';
import map from 'lodash-es/map';
import { NewPoolStage2 } from './Step2';
import { NewPoolStage3 } from './Step3';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { TModal } from '../../../interfaces';

const defaultState = {
	pools: [
		{
			token: 'akt',
			ratio: '50',
			channel: 'Channel-1',
			amount: '100.323122',
		},
		{
			token: 'atom',
			ratio: '50',
			channel: 'Channel-1',
			amount: '100.123123',
		},
	],
	stage: 1,
} as IPoolState;
export const NewPool: FunctionComponent = () => {
	const [state, setState] = React.useState<IPoolState>(defaultState);
	const content = React.useMemo(() => {
		if (state.stage === 1) return <NewPoolStage1 poolState={state} setPoolState={setState} />;
		else if (state.stage === 2) return <NewPoolStage2 poolState={state} setPoolState={setState} />;
		else if (state.stage === 3) return <NewPoolStage3 poolState={state} setPoolState={setState} />;
	}, [state]);
	return (
		<div style={{ width: '656px' }} className="bg-surface rounded-2xl pt-8 pb-7.5 px-7.5 text-white-high">
			<div>{content}</div>
			<NewPoolButton state={state} setPoolState={setState} />
		</div>
	);
};

const NewPoolButton: FunctionComponent<INewPoolButton> = observer(({ state, setPoolState }) => {
	const { layoutStore } = useStore();
	const onNextClick = React.useCallback(() => {
		// data validation process
		if (state.stage === 1) {
			// check ratio & sum of ratio === 100
			let ratioError;
			const res = sumArray(
				map(state.pools, v => {
					if (Number(v.ratio) <= 0) {
						ratioError = true;
					}
					return v.ratio;
				}),
				10
			);
			if (ratioError) {
				alert('All pool ratios must be non-zero positive values');
				return;
			}
			if (Number(res) !== 100) {
				// TODO : replace all alerts with toast messages
				alert('Pool ratio does not sum to 100');
				return;
			}

			// check tokens are all different
			const tokenArr = map(state.pools, v => v.token);
			if (tokenArr.length !== [...new Set(tokenArr)]?.length) {
				alert('There should be no coiniciding tokens');
				return;
			}
		} else if (state.stage === 2) {
			// TODO : @Thunnini Compare token amounts and validate.
		} else if (state.stage === 3) {
			// TODO : @Thunnini Request create pools
			alert('Generated Pools!');
			layoutStore.updateCurrentModal(TModal.INIT);
		}
		console.log(state);

		setPoolState(prevState => ({ ...prevState, stage: prevState.stage + 1 }));
	}, [layoutStore, setPoolState, state]);

	return (
		<button
			onClick={onNextClick}
			className="mt-7.5 w-2/3 h-15 rounded-2xl bg-primary-200 flex items-center justify-center mx-auto hover:opacity-75">
			<h6>{state.stage < 3 ? 'Next' : 'Create Pool'}</h6>
		</button>
	);
});

interface INewPoolButton {
	state: IPoolState;
	setPoolState: Dispatch<SetStateAction<IPoolState>>;
}

export interface IPoolState {
	pools: TPool[];
	stage: number;
}
export interface TPool {
	token: string;
	ratio: string;
	channel: string;
	amount: string;
}
