import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { Dec } from '@keplr-wallet/unit';

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
	const isIneligible = claimRecord
		.initialClaimableAmountOf(chainStore.current.stakeCurrency.coinMinimalDenom)
		.toDec()
		.equals(new Dec(0));

	return (
		<div className="w-full">
			<h5>Missions</h5>
			<ul className="flex flex-col gap-2.5 mt-7.5">
				<MissionCard
					num={0}
					complete={!isIneligible}
					description="Hold ATOM on February 18"
					ineligible={isIneligible}
				/>
				{Object.entries(claimRecord.completedActions)
					.sort(([action1], [action2]) => {
						/*
						 Move "vote" action to the end.
						 Some people could think that the actions should be executed in order.
						 But, the "vote" action can't be executed before the "stake" action.
						 So, to reduce the confusion of new users, Move "vote" action to after the "stake" action.
						 */
						if (action1 === 'vote') {
							return 1;
						}
						if (action2 === 'vote') {
							return -1;
						}
						return 0;
					})
					.map(([action, value]) => {
						return (
							<MissionCard
								key={action}
								num={
									Object.keys(claimRecord.completedActions)
										.sort((action1, action2) => {
											if (action1 === 'vote') {
												return 1;
											}
											if (action2 === 'vote') {
												return -1;
											}
											return 0;
										})
										.indexOf(action) + 1
								}
								complete={value}
								ineligible={isIneligible}
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
	ineligible: boolean;
}> = ({ num, description, complete, ineligible }) => {
	return (
		<li className="w-full rounded-2xl border border-white-faint py-5 px-7.5">
			<div className="flex justify-between items-center">
				<div>
					<p className="mb-1.5">Mission #{num}</p>
					<h6>{description}</h6>
				</div>
				<h6 className={cn(complete ? 'text-pass' : 'text-missionError')}>
					{ineligible ? 'Ineligible' : complete ? 'Complete' : 'Not Complete'}
				</h6>
			</div>
		</li>
	);
};
