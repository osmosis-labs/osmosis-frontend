import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import cn from 'clsx';
import { IPoolState, TPool } from './index';
import map from 'lodash-es/map';
import { LINKS, TOKENS } from '../../../constants';
import { Img } from '../../common/Img';
import { isNumber } from '../../../utils/scripts';
import noop from 'lodash-es/noop';
import upperCase from 'lodash-es/upperCase';
import { TokenListDisplay } from '../../common/TokenListDisplay';

export const NewPoolStage1: FunctionComponent<IPools> = ({ poolState, setPoolState }) => {
	const onAddToken = () =>
		setPoolState(prevState => {
			prevState.pools.push({ ...prevState.pools[0] });
			console.log('add???', prevState.pools);
			return { ...prevState };
		});
	return (
		<>
			<div className="pl-4.5">
				<h5 className="mb-4.5">Create New Pool</h5>
				<div className="inline w-full flex items-center">
					<p className="text-sm mr-2.5">Step 1/3 - Set token ratio </p>
					<div className="inline-block rounded-full w-3.5 h-3.5 text-xs bg-secondary-200 flex items-center justify-center text-black">
						!
					</div>
				</div>
			</div>
			<ul className="mt-5 flex flex-col gap-3">
				{map(poolState.pools, (pool, i) => {
					return (
						<Pool
							key={i}
							data={pool}
							setPoolPercent={(input: string) =>
								setPoolState(prevState => {
									prevState.pools[i].ratio = input;
									return prevState;
								})
							}
							setToken={(input: string) =>
								setPoolState(prevState => {
									prevState.pools[i].token = input;
									return prevState;
								})
							}
						/>
					);
				})}
			</ul>
			<div
				onClick={onAddToken}
				className="pt-6 pb-7.5 pl-7 border border-white-faint rounded-2xl mt-2.5 hover:border-enabledGold cursor-pointer">
				<div className="flex items-center">
					<div className="w-9 h-9 bg-primary-200 rounded-full flex justify-center items-center mr-5">
						<Img className="w-7 h-7 s-transition-all" src="/public/assets/Icons/Add.svg" />
					</div>
					<h5 className="text-white-high font-normal">Add new token</h5>
				</div>
			</div>
		</>
	);
};
export interface IPools {
	poolState: IPoolState;
	setPoolState: Dispatch<SetStateAction<IPoolState>>;
}

const Pool: FunctionComponent<IPool> = ({ data, setPoolPercent, setToken }) => {
	const [inputState, setInputState] = React.useState(data.ratio);

	React.useEffect(() => {
		if (!isNumber(inputState)) return;
		setPoolPercent(inputState);
	}, [data, inputState]);

	const [openSelector, setOpenSelector] = React.useState(false);

	return (
		<li className="pt-4.5 pb-4.5 pr-7 pl-4.5 border border-white-faint rounded-2xl relative">
			<div className="flex items-center justify-between">
				<TokenChannelDisplay data={data} openSelector={openSelector} setOpenSelector={() => setOpenSelector(v => !v)} />
				<div className="flex items-center">
					<input
						className="bg-black font-title py-1.5 h-9 rounded-lg mr-2.5 pr-1.5 border border-transparent focus:border-enabledGold text-white placeholder-white-disabled text-right text-lg leading-none"
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
						style={{ maxWidth: '130px' }}
					/>
					<h5>%</h5>
				</div>
			</div>
			<div
				style={{ top: 'calc(100% - 10px)', left: '-1px', width: 'calc(100% + 2px)' }}
				className={cn(
					'bg-surface rounded-b-2xl z-10 border-b border-r border-l border-white-faint',
					openSelector ? 'absolute' : 'hidden'
				)}>
				<TokenListDisplay close={() => setOpenSelector(false)} onSelect={newToken => setToken(newToken)} />
			</div>
		</li>
	);
};
interface IPool {
	data: TPool;
	setPoolPercent: (value: string) => void;
	setToken: (value: string) => void;
}

const TokenChannelDisplay: FunctionComponent<ITokenChannelDisplay> = ({
	data,
	openSelector,
	setOpenSelector = noop,
}) => {
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
					<Img
						onClick={() => setOpenSelector()}
						className={cn(
							'h-6 w-8 ml-1 p-2 cursor-pointer opacity-40 hover:opacity-100',
							openSelector ? 'rotate-180' : ''
						)}
						src="/public/assets/Icons/Down.svg"
					/>
				</div>
				<p className="text-sm text-iconDefault mt-1">{data.channel}</p>
			</div>
		</div>
	);
};
interface ITokenChannelDisplay {
	data: TPool;
	openSelector?: boolean;
	setOpenSelector?: () => void;
}
