import React, { FunctionComponent } from 'react';
import { useStore } from '../../stores';
import { Dec, IntPretty } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';

export const MyAirdropProgress: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, accountStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const claimRecord = queries.osmosis.queryClaimRecord.get(account.bech32Address);

	const totalClaimable = claimRecord.initialClaimableAmountOf(chainStore.current.stakeCurrency.coinMinimalDenom);

	const completed = claimRecord.completedActions;

	const countOfCompleted = (() => {
		let count = 0;
		for (const key of Object.keys(completed)) {
			if (key in completed && completed[key as 'addLiquidity' | 'swap' | 'vote' | 'delegate']) {
				count++;
			}
		}
		return count;
	})();

	// Actually 1/5 of airdrop is distributes from the genesis.
	// If there is no intial claimable, assume that the user is not deserved to get the airdrop.
	// Else, add the 20% to the percentage
	let percent = totalClaimable.toDec().equals(new Dec(0)) ? new IntPretty(new Dec(0)) : new IntPretty(new Dec(20));
	percent = percent.add(new Dec(20 * countOfCompleted));

	return (
		<React.Fragment>
			<h5 className="mb-2 font-normal">My Progress</h5>
			<div className="w-full mb-4.5">
				<div className="w-full flex justify-end items-end">
					<h4>{percent.maxDecimals(0).toString()}%</h4>
				</div>
				<div className="w-full relative h-3 rounded-2xl bg-background mt-2.5">
					<div
						style={{
							width: `${percent.maxDecimals(0).toString()}%`,
							background: 'linear-gradient(270deg, #89EAFB 0%, #1377B0 100%)',
						}}
						className="absolute rounded-2xl h-3 left-0 top-0"
					/>
				</div>
			</div>
		</React.Fragment>
	);
});
