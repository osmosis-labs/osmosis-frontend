import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import cn from 'clsx';
import { formatNumber } from '../../../utils/format';
import { IToken, MISC, TOKENS } from '../../../constants';
import map from 'lodash-es/map';
import times from 'lodash-es/times';
import { isNumber } from '../../../utils/scripts';

enum TTABS {
	ADD,
	REMOVE,
}

const tokenData: ITokenLiquidity[] = [
	{
		token: 'atom',
		amount: 25,
		percent: 50,
	},
	{ token: 'iris', amount: 25, percent: 25 },
];
export const ManageLiquidityModal: FunctionComponent = () => {
	const [stage, setStage] = React.useState(1);

	// TODO : @Thunnini fetch available balance for each token, apply to available
	const [addState, setAddState] = React.useState<ILimitedAmount[]>(
		times(tokenData.length, () => ({ amount: '', available: 3502.350215 }))
	);

	const content = React.useMemo(() => {
		if (stage === 1) return <ManageLiquidity addState={addState} setAddState={setAddState} />;
	}, [stage, addState, setAddState]);

	return (
		<div style={{ width: '656px' }} className="bg-surface rounded-2xl pt-8 pb-7.5 px-7.5 text-white-high">
			{content}
			<NextButton stage={stage} data={addState} incStage={() => setStage(v => v + 1)} />
		</div>
	);
};

const ManageLiquidity: FunctionComponent<IManageLiquidity> = ({ addState, setAddState }) => {
	const [tab, setTab] = React.useState<TTABS>(TTABS.ADD);

	// TODO : @Thunnini fetch data
	const lpTotalBalance = 520322.1255;
	return (
		<>
			<h5 className="mb-9">Manage Liquidity</h5>
			<div className="mb-7.5">
				<AddRemoveSelectTab setTab={setTab} tab={tab} />
			</div>
			<p className="text-xs text-white-disabled mb-4.5">
				LP token balance: <span className="ml-1 text-secondary-200">{formatNumber(lpTotalBalance)} LPTOKEN</span>
			</p>
			<ul className="flex flex-col gap-4.5 mb-15">
				{map(tokenData, (data, i) => (
					<TokenLiquidityItem
						key={i}
						data={data}
						num={i}
						amountObj={addState[i]}
						updateInput={(v: string) =>
							setAddState(prevState => {
								prevState[i] = { ...prevState[i], amount: v };
								return [...prevState];
							})
						}
					/>
				))}
			</ul>
		</>
	);
};

interface IManageLiquidity {
	addState: ILimitedAmount[];
	setAddState: Dispatch<SetStateAction<ILimitedAmount[]>>;
}

interface ILimitedAmount {
	amount: string;
	available: number;
}

const NextButton: FunctionComponent<INextButton> = ({ data, incStage, stage }) => {
	const onButtonClick = React.useCallback(() => {
		for (const item of data) {
			if (Number(item.amount) > item.available) {
				alert('You do not have enough available balance for some of your inputs');
				return;
			}
		}
		incStage();
	}, [data]);

	return (
		<div className="w-full flex items-center justify-center">
			<button
				onClick={onButtonClick}
				className="w-2/3 h-15 bg-primary-200 rounded-2xl flex justify-center items-center hover:opacity-75 cursor-pointer">
				<p className="text-white-high font-semibold text-lg">{stage === 1 ? 'Add Liquidity' : 'Lock'}</p>
			</button>
		</div>
	);
};

interface INextButton {
	data: ILimitedAmount[];
	incStage: () => void;
	stage: number;
}

const TokenLiquidityItem: FunctionComponent<ITokenLiquidityItem> = ({ data, num, updateInput, amountObj }) => {
	// TODO : @Thunnini get available amounts
	return (
		<li className="w-full border border-white-faint rounded-2xl py-3.75 px-4">
			<section className="flex items-center justify-between">
				<div className="flex items-center">
					<figure style={{ fontSize: '60px' }} className={cn('c100 dark mr-5', `p${data.percent}`)}>
						<span>{data.percent}%</span>
						<div className="slice">
							<div style={{ background: `${borderImages[MISC.GRADIENTS[num]]}` }} className="bar" />
							<div className="fill" />
						</div>
					</figure>
					<div className="flex flex-col">
						<h5>{data.token.toUpperCase()}</h5>
						<p className="text-iconDefault">{TOKENS[data.token].LONG_NAME}</p>
					</div>
				</div>
				<div className="flex flex-col items-end">
					<p className="text-xs">
						Available <span className="text-primary-50">{formatNumber(amountObj.available)}</span>
					</p>
					<div className="bg-background px-1.5 py-0.5 rounded-lg">
						<input
							onChange={e => {
								if (!isNumber(e.currentTarget.value)) return;
								updateInput(e.currentTarget.value);
							}}
							value={amountObj.amount}
							className="text-xl text-white-high text-right"
						/>
					</div>
				</div>
			</section>
		</li>
	);
};
interface ITokenLiquidityItem {
	data: ITokenLiquidity;
	num: number;
	updateInput: (input: string) => void;
	amountObj: ILimitedAmount;
}

interface ITokenLiquidity {
	token: string;
	amount: number;
	percent: number;
}

const AddRemoveSelectTab: FunctionComponent<IAddRemoveSelectTabs> = ({ tab, setTab }) => {
	return (
		<ul className="w-full h-8 grid grid-cols-2">
			<li
				onClick={() => setTab(TTABS.ADD)}
				className={cn(
					'w-full h-full flex justify-center items-center border-secondary-200 group cursor-pointer',
					tab === TTABS.ADD ? 'border-b-2' : 'border-b border-opacity-30 hover:border-opacity-100'
				)}>
				<p className={cn('text-secondary-200', tab === TTABS.ADD ? 'pt-0.25' : 'opacity-40 group-hover:opacity-75')}>
					Add Liquidity
				</p>
			</li>
			<li
				onClick={() => setTab(TTABS.REMOVE)}
				className={cn(
					'w-full h-full flex justify-center items-center border-secondary-200 group cursor-pointer',
					tab === TTABS.REMOVE ? 'border-b-2' : 'border-b border-opacity-30 hover:border-opacity-100'
				)}>
				<p className={cn('text-secondary-200', tab === TTABS.REMOVE ? 'pt-0.25' : 'opacity-40 group-hover:opacity-75')}>
					Remove Liquidity
				</p>
			</li>
		</ul>
	);
};
interface IAddRemoveSelectTabs {
	tab: TTABS;
	setTab: Dispatch<SetStateAction<TTABS>>;
}

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
