import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

export const ActionToDescription: { [action: string]: string } = {
	addLiquidity: 'Add liquidity to a pool',
	swap: 'Make a swap on Osmosis AMM',
	vote: 'Vote on a governance proposal',
	delegate: 'Stake OSMO',
};

export const AirdropMissions: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, accountStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const claimRecord = queries.osmosis.queryClaimRecord.get(account.bech32Address);

	return (
		<div className="w-full">
			<h5>Missions</h5>
			<ul className="flex flex-col gap-2.5 mt-7.5">
				{Object.entries(claimRecord.completedActions).map(([action, value]) => {
					return (
						<MissionCard
							key={action}
							num={Object.keys(claimRecord.completedActions).indexOf(action) + 1}
							complete={value}
							description={ActionToDescription[action] ?? 'Oops'}
						/>
					);
				})}
			</ul>
		</div>
	);
});

const MissionCard: FunctionComponent<{
	num: number;
	description: string;
	complete: boolean;
}> = ({ num, description, complete }) => {
	return (
		<li className="w-full rounded-2xl border border-white-faint py-5 px-7.5">
			<div className="flex justify-between items-center">
				<div>
					<p className="mb-1.5">Mission #{num}</p>
					<h6>{description}</h6>
				</div>
				<h6 className={cn(complete ? 'text-pass' : 'text-missionError')}>{complete ? 'Complete' : 'Not Complete'}</h6>
			</div>
		</li>
	);
};
