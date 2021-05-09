import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import cn from 'clsx';
import { formatNumber } from '../../../utils/format';
import { MISC, TOKENS } from '../../../constants';
import map from 'lodash-es/map';
import times from 'lodash-es/times';
import { isNumber } from '../../../utils/scripts';
import { fixed } from '../../../utils/Big';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { TModal } from '../../../interfaces';

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
	{ token: 'iris', amount: 25, percent: 50 },
];
export const ManageLiquidityModal: FunctionComponent = () => {
	const [tab, setTab] = React.useState<TTABS>(TTABS.ADD);
	const [stage, setStage] = React.useState(1);

	// TODO : @Thunnini fetch available balance for each token, apply to available
	const [addState, setAddState] = React.useState<ILimitedAmount[]>(
		times(tokenData.length, () => ({ amount: '', available: 3502.350215, currentLiquidity: 150.512321 }))
	);

	// TODO : @Thunnini fetch available lockup periods and apys. + Possibly maximum amount to lock?
	const [lockupData, setLockupData] = React.useState<ILockupData>({
		data: [
			{
				days: 30,
				apyPercent: 328.31,
			},
			{
				days: 60,
				apyPercent: 328.31,
			},
			{
				days: 90,
				apyPercent: 328.31,
			},
		],
		amount: '',
		selected: 0,
	});

	const content = React.useMemo(() => {
		if (stage === 1) return <ManageLiquidity addState={addState} setAddState={setAddState} tab={tab} setTab={setTab} />;
		else return <LockTokens data={lockupData} setData={setLockupData} />;
	}, [stage, addState, setAddState, tab, setTab, lockupData]);

	return (
		<div style={{ width: '656px' }} className="bg-surface rounded-2xl pt-8 pb-7.5 px-7.5 text-white-high">
			{content}
			<NextButton
				lockupData={lockupData}
				tab={tab}
				stage={stage}
				data={addState}
				incStage={() => setStage(v => v + 1)}
			/>
		</div>
	);
};

const LockTokens: FunctionComponent<ILockTokens> = ({ data, setData }) => {
	// TODO : @Thunnini fetch available lp Token amount
	const availableLPToken = 3502.350215;

	return (
		<>
			<h5 className="mb-10 font-normal">Lock LP tokens</h5>
			<p className="mb-10">Lockup period</p>
			<ul className="grid grid-cols-3 gap-9 mb-6">
				{map(data.data, (item, i) => (
					<LockupItem
						key={i}
						apyPercent={item.apyPercent}
						days={item.days}
						setSelected={() => setData(prevData => ({ ...prevData, selected: i }))}
						selected={data.selected === i}
					/>
				))}
			</ul>
			<div className="w-full pt-3 pb-3.5 pl-3 pr-2.5 border border-white-faint rounded-2xl mb-15">
				<p className="mb-3">Amount to lock</p>
				<p className="text-sm mb-3.5">
					Available LP token: <span className="text-primary-50">{availableLPToken}</span>
				</p>
				<div className="w-full rounded-lg bg-background px-2.5 grid" style={{ gridTemplateColumns: '1fr 40px' }}>
					<input
						value={data.amount}
						onChange={e => {
							if (!isNumber(e.currentTarget.value)) return;
							const value = e.currentTarget.value;
							setData(prevValue => ({ ...prevValue, amount: value }));
						}}
						className="text-white-high text-xl text-left font-title"
					/>
					<button
						onClick={() => setData(prevData => ({ ...prevData, amount: `${availableLPToken}` }))}
						className="flex items-center justify-center bg-primary-200 rounded-md w-full my-1.5">
						<p className="text-xs leading-none font-normal">MAX</p>
					</button>
				</div>
			</div>
		</>
	);
};
const LockupItem: FunctionComponent<ILockupItem> = ({ days, apyPercent, selected, setSelected }) => {
	return (
		<li
			onClick={setSelected}
			className={cn(
				'shadow-elevation-08dp rounded-2xl border py-5 px-4.5 border-opacity-30',
				selected ? 'border-enabledGold' : 'border-white-faint cursor-pointer hover:opacity-75'
			)}>
			<div className="flex items-center">
				<figure
					className={cn(
						'rounded-full w-4 h-4 mr-4',
						selected ? 'border-secondary-200 border-4 bg-white-high' : 'border-iconDefault border'
					)}
				/>
				<div className="flex flex-col">
					<h5>{days} days</h5>
					<p className="text-secondary-200">{fixed(apyPercent, 2)}%</p>
				</div>
			</div>
		</li>
	);
};

const ManageLiquidity: FunctionComponent<IManageLiquidity> = ({ addState, setAddState, tab, setTab }) => {
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
						tab={tab}
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

const NextButton: FunctionComponent<INextButton> = observer(({ data, incStage, stage, tab, lockupData }) => {
	const { layoutStore } = useStore();

	// TODO : @Thunnini fetch available lp tokens
	const availableLpToken = 3502.350215;
	const onButtonClick = React.useCallback(() => {
		if (stage === 1) {
			for (const item of data) {
				if (Number(item.amount) > (tab === TTABS.ADD ? item.available : item.currentLiquidity)) {
					alert(
						`You do not have enough ${tab === TTABS.ADD ? 'available  balance' : 'liquidity'} for some of your inputs`
					);
					return;
				}
			}
			incStage();
		} else {
			//	check lockupData from problems
			if (Number(lockupData.amount) > availableLpToken) {
				alert('Tokens to lockup exceed current available Lp token amount');
				return;
			} else if (Number(lockupData.amount) <= 0) {
				alert('Token lockup amount must be a positive number');
				return;
			}
			alert('Successfully Locked Tokens');
			layoutStore.updateCurrentModal(TModal.INIT);
		}
	}, [data, incStage, lockupData.amount, stage, tab, layoutStore]);

	return (
		<div className="w-full flex items-center justify-center">
			<button
				onClick={onButtonClick}
				className="w-2/3 h-15 bg-primary-200 rounded-2xl flex justify-center items-center hover:opacity-75 cursor-pointer">
				<p className="text-white-high font-semibold text-lg">
					{stage === 1 ? `${tab === TTABS.ADD ? 'Add' : 'Remove'} Liquidity` : 'Lock'}
				</p>
			</button>
		</div>
	);
});

const TokenLiquidityItem: FunctionComponent<ITokenLiquidityItem> = ({ data, num, updateInput, amountObj, tab }) => {
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
						{tab === TTABS.ADD ? (
							<>
								Available <span className="text-primary-50">{formatNumber(amountObj.available)}</span>
							</>
						) : (
							<>
								Allocated <span className="text-primary-50">{formatNumber(amountObj.currentLiquidity)}</span>
							</>
						)}
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

interface ILockupItem extends ILockupDataItem {
	selected: boolean;
	setSelected: () => void;
}

interface ILockTokens {
	data: ILockupData;
	setData: Dispatch<SetStateAction<ILockupData>>;
}

interface ILockupData {
	data: ILockupDataItem[];
	amount: string;
	selected: number;
}

interface ILockupDataItem {
	days: number;
	apyPercent: number;
}

interface ITokenLiquidityItem {
	data: ITokenLiquidity;
	num: number;
	updateInput: (input: string) => void;
	amountObj: ILimitedAmount;
	tab: TTABS;
}

interface INextButton {
	data: ILimitedAmount[];
	incStage: () => void;
	stage: number;
	lockupData: ILockupData;
	tab: TTABS;
}

interface IManageLiquidity {
	addState: ILimitedAmount[];
	setAddState: Dispatch<SetStateAction<ILimitedAmount[]>>;
	tab: TTABS;
	setTab: Dispatch<SetStateAction<TTABS>>;
}

interface ILimitedAmount {
	amount: string;
	available: number;
	currentLiquidity: number;
}

interface ITokenLiquidity {
	token: string;
	amount: number;
	percent: number;
}

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
