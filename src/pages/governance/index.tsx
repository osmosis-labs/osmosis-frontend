import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import moment from 'dayjs';
import { GovernanceOverview } from './GovernanceOverview';
import { StakingTab } from './Staking';
import { GovernanceTab } from './Governance';

export interface IGovernanceState {
	activeValidators: number;
	stakingRewards: number;
	cliff: number; //	unix time
}
enum TTab {
	STAKING,
	GOVERNANCE,
}
export const GovernancePage: FunctionComponent = observer(() => {
	const [tab, setTab] = React.useState<TTab>(TTab.STAKING);

	const [state, setState] = React.useState<IGovernanceState>({
		activeValidators: 87,
		stakingRewards: 0.1285,
		cliff: moment()
			.add(Math.random() * 96 + 48, 'hour')
			.valueOf(),
	});

	return (
		<div className="w-full h-full bg-surface">
			<div className="px-15 bg-background">
				<div className="py-10 max-w-max mx-auto">
					<GovernanceOverview state={state} />
				</div>
			</div>
			<div className="px-15 pt-2 pb-10">
				<div className="max-w-max mx-auto">
					<TabSelect tab={tab} setTab={setTab} />
					<div className={cn({ hidden: tab !== TTab.STAKING }, 'w-full h-full')}>
						<StakingTab />
					</div>
					<div className={cn({ hidden: tab !== TTab.GOVERNANCE }, 'w-full h-full')}>
						<GovernanceTab />
					</div>
				</div>
			</div>
		</div>
	);
});

const TabSelect: FunctionComponent<{ tab: TTab; setTab: Dispatch<SetStateAction<TTab>> }> = ({ tab, setTab }) => {
	return (
		<div className="w-full h-15 grid grid-cols-2">
			<button
				onClick={() => setTab(TTab.STAKING)}
				className={cn(
					'flex items-center justify-center border-secondary-200',
					tab === TTab.STAKING
						? 'border-b-4'
						: 'border-b border-opacity-30 hover:border-opacity-75 hover: border-b-2 group'
				)}>
				<h6 className={cn('text-secondary-200', tab !== TTab.STAKING ? 'opacity-30 group-hover:opacity-75 pb-1' : '')}>
					Staking
				</h6>
			</button>
			<button
				onClick={() => setTab(TTab.GOVERNANCE)}
				className={cn(
					'flex items-center justify-center border-secondary-200',
					tab === TTab.GOVERNANCE
						? 'border-b-4'
						: 'border-b border-opacity-30  hover:border-opacity-75 hover: border-b-2 group'
				)}>
				<h6
					className={cn('text-secondary-200', tab !== TTab.GOVERNANCE ? 'opacity-30 group-hover:opacity-75 pb-1' : '')}>
					Governance
				</h6>
			</button>
		</div>
	);
};
