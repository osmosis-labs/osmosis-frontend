import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { IPools } from './Step1';
import { Img } from '../../components/common/Img';
import { LINKS } from '../../constants';
import { TPool } from './index';
import map from 'lodash-es/map';
import upperCase from 'lodash-es/upperCase';
import { isNumber } from '../../utils/scripts';

export const NewPoolStage2: FunctionComponent<IPools> = ({ poolState, setPoolState }) => {
	return (
		<>
			<div className="pl-4.5">
				<h5 className="mb-4.5">Create New Pool</h5>
				<div className="inline w-full flex items-center">
					<p className="text-sm mr-2.5">Step 2/3 - Input amount to Add </p>
					<div className="inline-block rounded-full w-3.5 h-3.5 text-xs bg-secondary-200 flex items-center justify-center text-black">
						!
					</div>
				</div>
			</div>
			<ul className="mt-5 flex flex-col gap-3">
				{map(poolState.pools, (pool, i) => (
					<Pool
						key={i}
						data={pool}
						updateAmount={(input: string) =>
							setPoolState(prevState => {
								prevState.pools[i].amount = input;
								return { ...prevState };
							})
						}
					/>
				))}
			</ul>
		</>
	);
};

const Pool: FunctionComponent<IPool> = ({ data, updateAmount }) => {
	// TODO : @Thunnini fetch user's balance for this token
	const balance = 342.124532;

	const [inputState, setInputState] = React.useState(data.amount);

	React.useEffect(() => {
		if (!isNumber(inputState)) return;
		updateAmount(inputState);
	}, [data, inputState]);
	return (
		<li className="pt-4.5 pb-4.5 pr-7 pl-4.5 border border-white-faint rounded-2xl relative">
			<div className="flex items-center justify-between">
				<TokenRatioDisplay data={data} />
				<div className="flex flex-col items-end">
					<div className="flex items-center mb-1">
						<p className="text-white-emphasis text-sm">Balance: {balance}</p>
						<button onClick={() => alert('not implemented')} className="rounded-2xl border border-enabledGold ml-2.5">
							<p className="text-secondary-200 text-sm px-2.5">MAX</p>
						</button>
					</div>
					<div className="grid" style={{ gridTemplateColumns: '181px 80px' }}>
						<input
							className="w-full font-title bg-black py-1.5 h-9 rounded-lg mr-2.5 pr-1.5 border border-transparent focus:border-enabledGold text-white placeholder-white-disabled text-right text-lg leading-none"
							onChange={e => {
								if (
									!isNumber(e.currentTarget.value) ||
									Number(e.currentTarget.value) < 0 ||
									e.currentTarget.value.length > 10
								)
									return;
								setInputState(e.currentTarget.value);
							}}
							value={inputState}
						/>
						<div className="flex items-center justify-end">
							<h6 className="text-right">{data.token.toUpperCase()}</h6>
						</div>
					</div>
				</div>
			</div>
		</li>
	);
};
interface IPool {
	data: TPool;
	updateAmount: (input: string) => void;
}

const TokenRatioDisplay: FunctionComponent<Record<'data', TPool>> = ({ data }) => {
	return (
		<div className="flex items-center">
			<figure
				style={{ width: '56px', height: '56px' }}
				className="flex justify-center items-center rounded-full border-secondary-200 border mr-3">
				<Img loadingSpin style={{ width: '44px', height: '44px' }} src={LINKS.GET_TOKEN_IMG(data.token)} />
			</figure>
			<div className="flex flex-col">
				<div className="flex items-center">
					<h5 className="leading-none font-semibold">{upperCase(data.token)}</h5>
				</div>
				<p className="text-sm text-iconDefault mt-1">{data.ratio}%</p>
			</div>
		</div>
	);
};
